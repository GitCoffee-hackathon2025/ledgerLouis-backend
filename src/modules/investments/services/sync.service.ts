// Coleta dos provedores para o banco. Respeita TTL para não gastar a cota gratuita.

import { slugify } from "../../../domain/investments/groups.js";
import { BCB_SERIES, BCB_SOURCE, type createBcbClient } from "../../../infrastructure/market-data/bcb.js";
import { BRAPI_SOURCE, type createBrapiClient } from "../../../infrastructure/market-data/brapi.js";
import {
  CVM_BASE,
  CVM_SOURCE,
  ipeUrl,
  onlyDigits,
  type createCvmClient,
} from "../../../infrastructure/market-data/cvm.js";
import type { fetchFeed } from "../../../infrastructure/market-data/rss.js";
import type { Bar, FundamentalsData, ListedStock } from "../../../infrastructure/market-data/types.js";
import { YAHOO_SOURCE, type createYahooClient } from "../../../infrastructure/market-data/yahoo.js";
import { DEFAULT_NEWS_FEEDS, DEFAULT_NICHES, US_STOCKS } from "../data/defaults.js";
import type { Asset, NewsFeed, createMarketRepository } from "../repositories/market.repository.js";

const MINUTE = 60_000;
const QUOTE_TTL = 15 * MINUTE;
const SLOW_TTL = 24 * 60 * MINUTE;
const NEWS_TTL = 6 * 60 * MINUTE;
const TICKER_RE = /\b[A-Z]{4}\d{1,2}\b/g;
const AI_BUBBLE_RE = /(?<![\p{L}\d_])(ia|ai|inteligência artificial|artificial intelligence|bolha|bubble)(?![\p{L}\d_])/iu;

export const SYNC_JOBS = ["stocks", "fundamentals", "history", "us_stocks", "us_history", "macro", "news"] as const;
export type SyncJob = (typeof SYNC_JOBS)[number];

export interface SyncReport {
  ok: number;
  skipped: number;
  errors: string[];
}

export interface SyncClients {
  brapi: ReturnType<typeof createBrapiClient>;
  yahoo: ReturnType<typeof createYahooClient>;
  bcb: ReturnType<typeof createBcbClient>;
  cvm: ReturnType<typeof createCvmClient>;
  fetchFeed: typeof fetchFeed;
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const due = (feed: NewsFeed, now: Date) =>
  !feed.fetchedAt || feed.fetchedAt.getTime() < now.getTime() - NEWS_TTL;

export const createSyncService = (
  repo: ReturnType<typeof createMarketRepository>,
  clients: SyncClients,
) => {
  const quoteOf = (assetId: Asset["id"], s: ListedStock, source: string, fetchedAt: Date) => ({
    assetId,
    price: s.price,
    changePct: s.changePct,
    volume: s.volume,
    marketCap: s.marketCap,
    source,
    fetchedAt,
  });

  const fundamentalsOf = (assetId: Asset["id"], f: FundamentalsData, source: string, fetchedAt: Date) => ({
    assetId,
    revenue: f.revenue,
    ebitda: f.ebitda,
    totalDebt: f.totalDebt,
    totalCash: f.totalCash,
    eps: f.eps,
    roeReported: f.roe,
    source,
    fetchedAt,
  });

  async function syncStocks(limit = 50): Promise<SyncReport> {
    const now = new Date();
    if (await repo.hasFreshQuote(BRAPI_SOURCE, new Date(now.getTime() - QUOTE_TTL)))
      return { ok: 0, skipped: 1, errors: [] };

    const report: SyncReport = { ok: 0, skipped: 0, errors: [] };
    for (const s of await clients.brapi.listStocks(limit)) {
      const asset = await repo.upsertAsset({
        ticker: s.ticker,
        name: s.name,
        kind: s.kind,
        sector: s.sector,
        subsector: s.subsector,
        logoUrl: s.logoUrl,
      });
      await repo.insertQuote(quoteOf(asset.id, s, BRAPI_SOURCE, now));
      report.ok++;
    }
    return report;
  }

  async function syncFundamentals(): Promise<SyncReport> {
    const now = new Date();
    const report: SyncReport = { ok: 0, skipped: 0, errors: [] };
    const assets = await repo.listAssets({ market: "B3" });
    const last = await repo.latestFundamentals(assets.map((a) => a.id));

    for (const asset of assets) {
      if ((last.get(asset.id)?.fetchedAt.getTime() ?? 0) >= now.getTime() - SLOW_TTL) continue;

      try {
        const data = await clients.brapi.fundamentals(asset.ticker);
        if (!data) {
          report.skipped++;
          continue;
        }
        await repo.insertFundamentals(fundamentalsOf(asset.id, data, BRAPI_SOURCE, now));
        report.ok++;
      } catch (e) {
        // um ativo com problema não derruba os outros
        report.errors.push(`${asset.ticker}: ${message(e)}`);
      }
    }
    return report;
  }

  /** Candles diários por ativo, uma vez por dia (cada ativo é uma chamada à cota do provedor). */
  async function syncHistory(
    market: "B3" | "US",
    history: (ticker: string) => Promise<Bar[] | null>,
    source: string,
  ): Promise<SyncReport> {
    const now = new Date();
    const report: SyncReport = { ok: 0, skipped: 0, errors: [] };
    const fetched = await repo.lastBarFetch();

    for (const asset of await repo.listAssets({ market })) {
      if ((fetched.get(asset.id)?.getTime() ?? 0) >= now.getTime() - SLOW_TTL) continue;

      try {
        const bars = await history(asset.ticker);
        if (!bars?.length) {
          report.skipped++;
          continue;
        }
        await repo.upsertBars(asset.id, bars, source, now);
        report.ok++;
      } catch (e) {
        report.errors.push(`${asset.ticker}: ${message(e)}`);
      }
    }
    return report;
  }

  /**
   * Cotação + fundamentos dos EUA numa chamada só por ativo. Cotação a cada 15 min,
   * fundamentos só a cada 24h (o mesmo snapshot já serve: não vale outra ida à rede para descartar).
   */
  async function syncUsStocks(): Promise<SyncReport> {
    const now = new Date();
    if (await repo.hasFreshQuote(YAHOO_SOURCE, new Date(now.getTime() - QUOTE_TTL)))
      return { ok: 0, skipped: 1, errors: [] };

    const report: SyncReport = { ok: 0, skipped: 0, errors: [] };
    for (const spec of US_STOCKS) {
      try {
        const [stock, fundamentals] = await clients.yahoo.snapshot(spec.ticker, spec.name);
        const asset = await repo.upsertAsset({
          ticker: spec.ticker,
          name: stock.name,
          kind: stock.kind,
          market: "US",
          aliases: spec.aliases,
        });
        await repo.insertQuote(quoteOf(asset.id, stock, YAHOO_SOURCE, now));

        const last = (await repo.latestFundamentals([asset.id])).get(asset.id);
        if (fundamentals && (last?.fetchedAt.getTime() ?? 0) < now.getTime() - SLOW_TTL)
          await repo.insertFundamentals(fundamentalsOf(asset.id, fundamentals, YAHOO_SOURCE, now));

        report.ok++;
      } catch (e) {
        report.errors.push(`${spec.ticker}: ${message(e)}`);
      }
    }
    return report;
  }

  async function syncMacro(last = 13): Promise<SyncReport> {
    const now = new Date();
    const report: SyncReport = { ok: 0, skipped: 0, errors: [] };

    for (const [code, [name, unit]] of Object.entries(BCB_SERIES)) {
      if (await repo.hasFreshMacro(code, new Date(now.getTime() - SLOW_TTL))) {
        report.skipped++;
        continue;
      }
      try {
        const points = await clients.bcb.series(code, last);
        await repo.upsertMacro({ code, name, unit, source: BCB_SOURCE }, points, now);
        report.ok++;
      } catch (e) {
        report.errors.push(`SGS ${code}: ${message(e)}`);
      }
    }
    return report;
  }

  async function syncCvm(year: number, now: Date, report: SyncReport) {
    const { feed } = await repo.getOrCreateFeed({
      url: ipeUrl(year),
      name: "CVM: fatos relevantes",
    });
    if (!due(feed, now)) {
      report.skipped++;
      return;
    }

    try {
      for (const [cnpj, tickers] of await clients.cvm.tickersByCnpj(year))
        await repo.fillCnpj([...tickers], cnpj);

      const byCnpj = new Map<string, Asset["id"][]>();
      for (const a of await repo.listAssets({ includeInactive: true })) {
        if (!a.cnpj) continue;
        const key = onlyDigits(a.cnpj);
        byCnpj.set(key, [...(byCnpj.get(key) ?? []), a.id]);
      }

      for (const f of await clients.cvm.filings(year)) {
        const assetIds = byCnpj.get(f.cnpj);
        if (!assetIds) continue;

        await repo.saveNews(
          {
            title: f.title,
            url: f.url,
            source: CVM_SOURCE,
            kind: f.kind,
            // a CVM informa só o dia: meia-noite no horário de Brasília
            publishedAt: new Date(`${f.delivered}T00:00:00-03:00`),
          },
          assetIds,
        );
        report.ok++;
      }
    } catch (e) {
      report.errors.push(`CVM: ${message(e)}`);
      return;
    }
    await repo.touchFeed(feed.id, now);
  }

  /** Ticker (formato B3) ou alias (trecho do título, sem diferenciar maiúscula/minúscula). */
  function matchingAssets(title: string, known: Map<string, Asset>, aliased: Asset[]) {
    const hits = new Set<Asset["id"]>();
    for (const t of title.match(TICKER_RE) ?? []) {
      const asset = known.get(t);
      if (asset) hits.add(asset.id);
    }

    const low = title.toLowerCase();
    for (const a of aliased)
      if (a.aliases.some((alias) => low.includes(alias.toLowerCase()))) hits.add(a.id);

    return [...hits];
  }

  async function syncRss(now: Date, report: SyncReport) {
    const known = new Map(
      (await repo.listAssets({ includeInactive: true })).map((a) => [a.ticker, a]),
    );
    const aliased = [...known.values()].filter((a) => a.aliases.length);

    for (const feed of await repo.rssFeeds(CVM_BASE)) {
      if (!due(feed, now)) {
        report.skipped++;
        continue;
      }
      try {
        let items = await clients.fetchFeed(feed.url, now);
        if (feed.category === "ia_bolha") items = items.filter((i) => AI_BUBBLE_RE.test(i.title));

        for (const i of items) {
          await repo.saveNews(
            { title: i.title, url: i.url, source: feed.name, kind: "noticia", publishedAt: i.publishedAt },
            matchingAssets(i.title, known, aliased),
          );
          report.ok++;
        }
        await repo.touchFeed(feed.id, now);
      } catch (e) {
        report.errors.push(`${feed.name}: ${message(e)}`);
      }
    }
  }

  async function syncNews(year?: number): Promise<SyncReport> {
    const now = new Date();
    const report: SyncReport = { ok: 0, skipped: 0, errors: [] };

    await syncCvm(year ?? now.getFullYear(), now, report);
    await syncRss(now, report);
    return report;
  }

  const jobs: Record<SyncJob, (limit?: number) => Promise<SyncReport>> = {
    stocks: (limit) => syncStocks(limit),
    fundamentals: () => syncFundamentals(),
    history: () => syncHistory("B3", clients.brapi.history, BRAPI_SOURCE),
    us_stocks: () => syncUsStocks(),
    us_history: () => syncHistory("US", clients.yahoo.history, YAHOO_SOURCE),
    macro: () => syncMacro(),
    news: () => syncNews(),
  };

  return {
    /** Roda um job, ou todos na ordem. Um job que falha não impede os seguintes. */
    async run(only?: SyncJob, limit = 50) {
      const reports = {} as Record<SyncJob, SyncReport>;
      for (const name of SYNC_JOBS) {
        if (only && name !== only) continue;
        reports[name] = await jobs[name](limit).catch((e) => ({
          ok: 0,
          skipped: 0,
          errors: [message(e)],
        }));
      }
      return reports;
    },

    /** Cria os nichos iniciais e liga os tickers existentes. Idempotente; não remove ligações feitas depois. */
    async seedNiches() {
      let linked = 0;
      for (const spec of DEFAULT_NICHES) {
        const niche = await repo.getOrCreateNiche({
          slug: slugify(spec.name),
          name: spec.name,
          description: spec.description,
          macroCodes: spec.macro,
          external: spec.external ?? false,
        });
        const assets = await repo.listAssets({ tickers: spec.tickers, includeInactive: true });

        await repo.linkNicheAssets(niche.id, assets.map((a) => a.id));
        linked += assets.length;
      }
      return linked;
    },

    /** Cadastra os feeds iniciais de geopolítica e bolha da IA. Idempotente (url é única). */
    async seedNewsFeeds() {
      let created = 0;
      for (const spec of DEFAULT_NEWS_FEEDS)
        if ((await repo.getOrCreateFeed(spec)).created) created++;
      return created;
    },
  };
};
