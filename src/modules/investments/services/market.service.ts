import { AppError } from "../../../shared/errors/domain/errors.js";
import type { ULID } from "../../../domain/shared/id.js";
import { computeIndicators, type Indicators } from "../../../domain/investments/fundamentals.js";
import { compareToMedian, slugify, summarize } from "../../../domain/investments/groups.js";
import {
  annualizedVolatility,
  periodReturn,
  rsi,
  sma,
} from "../../../domain/investments/technical.js";
import type {
  Asset,
  NewsItem,
  createMarketRepository,
} from "../repositories/market.repository.js";

const MAX_CONTEXT_BYTES = 4096;

// Telas que o Claude pode abrir no dashboard (as mesmas rotas do frontend)
const SCREEN_PATH =
  /^\/(grupos(\/(sector|niche)\/[a-z0-9-]+)?|mercado-eua|acoes\/[A-Z0-9]{1,7}|carteira(\/propostas\/[0-9A-Z]{26})?|alertas|placar)?$/;

export interface AssetPayload {
  ticker: string;
  name: string;
  market: "B3" | "US";
  sector: string;
  subsector: string;
  logo_url: string;
  quote: {
    price: number | null;
    change_pct: number | null;
    volume: number | null;
    market_cap: number | null;
    source: string;
    fetched_at: Date;
  } | null;
  indicators: Indicators;
  fundamentals_source: string | null;
  fundamentals_fetched_at: Date | null;
}

export const createMarketService = (repo: ReturnType<typeof createMarketRepository>) => {
  /** Payload da lista: cotação mais recente e indicadores calculados de cada ativo. */
  async function assetPayloads(assets: Asset[]): Promise<AssetPayload[]> {
    const ids = assets.map((a) => a.id);
    const [quotes, fundamentals] = await Promise.all([
      repo.latestQuotes(ids),
      repo.latestFundamentals(ids),
    ]);

    return assets.map((a) => {
      const q = quotes.get(a.id);
      const f = fundamentals.get(a.id);

      return {
        ticker: a.ticker,
        name: a.name,
        market: a.market,
        sector: a.sector,
        subsector: a.subsector,
        logo_url: a.logoUrl,
        quote: q
          ? {
              price: q.price,
              change_pct: q.changePct,
              volume: q.volume,
              market_cap: q.marketCap,
              source: q.source,
              fetched_at: q.fetchedAt,
            }
          : null,
        indicators: computeIndicators({ ...f, price: q?.price, marketCap: q?.marketCap }),
        fundamentals_source: f?.source ?? null,
        fundamentals_fetched_at: f?.fetchedAt ?? null,
      };
    });
  }

  function summary(
    kind: "sector" | "niche",
    slug: string,
    name: string,
    members: AssetPayload[],
  ) {
    return {
      kind,
      slug,
      name,
      ...summarize(
        members.map((m) => ({
          marketCap: m.quote?.market_cap ?? null,
          changePct: m.quote?.change_pct ?? null,
          indicators: m.indicators,
        })),
      ),
    };
  }

  /** slug -> nome do setor e payloads dos ativos da B3. */
  async function sectorMembers() {
    const assets = (await repo.listAssets({ market: "B3" })).filter((a) => a.sector);
    const groups = new Map<string, { name: string; members: AssetPayload[] }>();

    for (const m of await assetPayloads(assets)) {
      const slug = slugify(m.sector);
      if (!groups.has(slug)) groups.set(slug, { name: m.sector, members: [] });
      groups.get(slug)!.members.push(m);
    }
    return groups;
  }

  /** `tickers` limita quais tickers ligados aparecem em cada notícia; sem ele, aparecem todos. */
  async function newsPayload(items: NewsItem[], tickers?: string[]) {
    const linked = await repo.newsTickers(items.map((n) => n.id));

    return items.map((n) => ({
      title: n.title,
      url: n.url,
      source: n.source,
      kind: n.kind,
      published_at: n.publishedAt,
      tickers: (linked.get(n.id) ?? [])
        .filter((t) => !tickers || tickers.includes(t))
        .sort(),
    }));
  }

  async function latestMacro(codes?: string[]) {
    return (await repo.latestMacro(codes)).map((p) => ({
      code: p.code,
      name: p.name,
      unit: p.unit,
      date: p.date,
      value: p.value,
      source: p.source,
      fetched_at: p.fetchedAt,
    }));
  }

  return {
    assetPayloads,
    latestMacro,

    async listAssets(f: { market?: "B3" | "US"; sector?: string } = { market: "B3" }) {
      return assetPayloads(await repo.listAssets(f));
    },

    /** Página da ação: payload da lista + histórico, técnicos, saúde contra a mediana do setor, nichos e notícias. */
    async assetFull(ticker: string, withBars = true) {
      const asset = await repo.findAssetByTicker(ticker.trim().toUpperCase());
      if (!asset) throw new AppError("ASSET_NOT_FOUND");

      const [[base], allBars, peerAssets, niches, news] = await Promise.all([
        assetPayloads([asset]),
        repo.bars(asset.id),
        asset.sector ? repo.listAssets({ sector: asset.sector }) : [],
        repo.nichesOfAsset(asset.id),
        repo.news({ assetIds: [asset.id], limit: 15 }),
      ]);

      const bars = allBars.filter((b) => b.close !== null);
      const closes = bars.map((b) => b.close!);
      const last = bars.at(-1);
      const peers = await assetPayloads(peerAssets);
      const slug = slugify(asset.sector);
      const medians = peers.length ? summary("sector", slug, asset.sector, peers).medians : {};

      return {
        ...base!,
        history: {
          source: last?.source ?? null,
          fetched_at: last?.fetchedAt ?? null,
          days: bars.length,
          rsi14: rsi(closes, 14),
          volatility: annualizedVolatility(closes),
          return_1m: periodReturn(closes, 21),
          return_period: closes.length > 1 ? periodReturn(closes, closes.length - 1) : null,
          ...(withBars && {
            bars: bars.map((b) => ({
              date: b.date,
              open: b.open,
              high: b.high,
              low: b.low,
              close: b.close,
              volume: b.volume,
            })),
            sma20: sma(closes, 20),
          }),
        },
        sector_group: asset.sector
          ? { slug, name: asset.sector, count: peers.length, medians }
          : null,
        health: compareToMedian(base!.indicators, medians),
        niches,
        news: await newsPayload(news, [asset.ticker]),
      };
    },

    async groups() {
      const niches = await repo.listNiches();
      const links = await repo.nicheAssets(niches.map((n) => n.id));
      const payloads = await assetPayloads(links.map((l) => l.asset));

      return {
        sectors: [...(await sectorMembers())].map(([slug, g]) =>
          summary("sector", slug, g.name, g.members),
        ),
        niches: niches.map((n) =>
          summary(
            "niche",
            n.slug,
            n.name,
            payloads.filter((_, i) => links[i]!.nicheId === n.id),
          ),
        ),
      };
    },

    async group(kind: string, slug: string) {
      let name: string;
      let description = "";
      let macroCodes: string[] = [];
      let assets: Asset[];
      let members: AssetPayload[];

      if (kind === "sector") {
        const sector = (await sectorMembers()).get(slug);
        if (!sector) throw new AppError("INVESTMENT_GROUP_NOT_FOUND");

        ({ name, members } = sector);
        assets = await repo.listAssets({ tickers: members.map((m) => m.ticker) });
      } else if (kind === "niche") {
        const niche = await repo.findNicheBySlug(slug);
        if (!niche) throw new AppError("INVESTMENT_GROUP_NOT_FOUND");

        ({ name, description, macroCodes } = niche);
        assets = (await repo.nicheAssets([niche.id])).map((l) => l.asset);
        members = await assetPayloads(assets);
      } else throw new AppError("INVESTMENT_GROUP_NOT_FOUND");

      const news = await repo.news({ assetIds: assets.map((a) => a.id), limit: 30 });

      return {
        ...summary(kind, slug, name, members),
        description,
        members,
        macro: macroCodes.length ? await latestMacro(macroCodes) : [],
        news: await newsPayload(news, members.map((m) => m.ticker)),
      };
    },

    /** Últimos 30 fechamentos de cada ação ativa, do mais antigo para o mais novo. */
    async sparklines() {
      const out: Record<string, number[]> = {};
      for (const { ticker, close } of await repo.recentCloses()) {
        const closes = (out[ticker] ??= []);
        if (close !== null && closes.length < 30) closes.unshift(close);
      }
      return out;
    },

    /** Notícias de uma categoria de feed (geopolitica, ia_bolha) mesmo sem ligação com uma ação. */
    async categoryNews(category: string) {
      const sources = await repo.feedNamesByCategory(category);
      return newsPayload(await repo.news({ sources, limit: 30 }));
    },

    /** Notícias e fatos relevantes mais recentes, com filtro opcional por ticker e tipo. */
    async news(f: { ticker?: string | undefined; kind?: string | undefined; limit?: number | undefined }) {
      const asset = f.ticker
        ? await repo.findAssetByTicker(f.ticker.trim().toUpperCase())
        : undefined;
      if (f.ticker && !asset) return [];

      return newsPayload(
        await repo.news({
          ...(asset && { assetIds: [asset.id] }),
          ...(f.kind && { kind: f.kind }),
          limit: Math.max(1, Math.min(f.limit ?? 20, 100)),
        }),
      );
    },

    // ---- tela aberta e comandos do Claude ----

    async getScreenContext(userId: ULID) {
      const ctx = await repo.getScreenContext(userId);
      return { payload: ctx?.payload ?? null, updated_at: ctx?.updatedAt ?? null };
    },

    async setScreenContext(userId: ULID, body: Record<string, unknown>) {
      if (typeof body.path !== "string" || JSON.stringify(body).length > MAX_CONTEXT_BYTES)
        throw new AppError("INVESTMENT_INVALID", {
          detail: "esperado um objeto JSON com 'path' (texto), até 4 KB",
        });

      await repo.setScreenContext(userId, body);
    },

    /** Pede ao dashboard do usuário que abra uma tela. */
    async requestNavigation(userId: ULID, rawPath: string, reason: string) {
      let path = rawPath.trim();
      if (path.startsWith("/acoes/")) path = `/acoes/${path.slice(7).toUpperCase()}`;
      if (!SCREEN_PATH.test(path))
        throw new AppError("INVESTMENT_INVALID", { detail: `tela desconhecida: ${path}` });

      return repo.createScreenCommand(userId, "navigate", {
        path,
        reason: reason.trim().slice(0, 300),
      });
    },

    /** Comandos mais novos que `after`. Sem `after`, devolve só o último id (o dashboard começa dali). */
    async screenCommands(userId: ULID, after?: string) {
      // "0" vem antes de qualquer ULID: é o "ainda não há comandos"
      const latest_id = (await repo.lastScreenCommandId(userId)) ?? "0";
      if (after === undefined) return { latest_id, commands: [] };

      return {
        latest_id,
        commands: (await repo.screenCommandsAfter(userId, after)).map((c) => ({
          id: c.id,
          action: c.action,
          payload: c.payload,
          created_at: c.createdAt,
        })),
      };
    },
  };
};
