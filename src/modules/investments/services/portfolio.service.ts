// Casos de uso da carteira, compartilhados pela API REST e pelo servidor MCP.

import { AppError } from "../../../shared/errors/domain/errors.js";
import type { ULID } from "../../../domain/shared/id.js";
import {
  EXPECTATION,
  exposureBySector,
  triggers,
  validateProposal,
  valuate,
} from "../../../domain/investments/portfolio.js";
import { dec } from "../../../infrastructure/market-data/types.js";
import type { Asset, Quote, createMarketRepository } from "../repositories/market.repository.js";
import type {
  PendingChange,
  Profile,
  ProfileUpdate,
  Proposal,
  PortfolioQueries,
  ProposalItem,
  createPortfolioRepository,
} from "../repositories/portfolio.repository.js";

type Repo = ReturnType<typeof createPortfolioRepository>;

const invalid = (detail: string) => new AppError("INVESTMENT_INVALID", { detail });
const weightOk = (v: unknown) => {
  const d = dec(v);
  return d !== null && d > 0 && d <= 1;
};
const isNumberField = (k: string) => k === "monthly_contribution" || k.startsWith("alert_");

// campo da API -> [coluna, regra]. Só estes campos podem ser gravados.
const PROFILE_RULES: Record<string, [keyof ProfileUpdate, (v: unknown) => boolean]> = {
  horizon_years: ["horizonYears", (v) => v === null || (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 100)],
  risk_tolerance: ["riskTolerance", (v) => ["", "conservador", "moderado", "arrojado"].includes(v as string)],
  monthly_contribution: ["monthlyContribution", (v) => v === null || v === "" || (dec(v) ?? -1) >= 0],
  avoid_sectors: ["avoidSectors", (v) => Array.isArray(v) && v.every((x) => typeof x === "string")],
  notes: ["notes", (v) => typeof v === "string"],
  alert_daily_drop_pct: ["alertDailyDropPct", (v) => (dec(v) ?? 0) > 0 && dec(v)! <= 100],
  alert_max_asset_weight: ["alertMaxAssetWeight", weightOk],
  alert_max_sector_weight: ["alertMaxSectorWeight", weightOk],
};

/** Data de hoje no Brasil (AAAA-MM-DD): o "mesmo dia" dos alertas não pode virar à meia-noite UTC. */
const todayInBrazil = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

export function profilePayload(p: Profile) {
  const out = {
    horizon_years: p.horizonYears,
    risk_tolerance: p.riskTolerance,
    monthly_contribution: p.monthlyContribution,
    avoid_sectors: p.avoidSectors,
    notes: p.notes,
    alert_daily_drop_pct: p.alertDailyDropPct,
    alert_max_asset_weight: p.alertMaxAssetWeight,
    alert_max_sector_weight: p.alertMaxSectorWeight,
  };
  const required = ["horizon_years", "risk_tolerance", "monthly_contribution"] as const;

  return { ...out, missing: required.filter((f) => out[f] === null || out[f] === "") };
}

function proposalStatus(decisions: string[]) {
  if (decisions.every((d) => d === "pendente")) return "rascunho";
  return decisions.includes("pendente") ? "em_revisao" : "concluida";
}

function itemPayload(item: ProposalItem, asset: Asset, quote: Quote | undefined) {
  return {
    id: item.id,
    ticker: asset.ticker,
    name: asset.name,
    sector: asset.sector,
    action: item.action,
    target_weight: item.targetWeight,
    thesis: item.thesis,
    risks: item.risks,
    invalidation: item.invalidation,
    sources: item.sources,
    price_at_proposal: item.priceAtProposal,
    current_price: quote?.price ?? null,
    decision: item.decision,
    adjusted_weight: item.adjustedWeight,
    comment: item.comment,
    decided_at: item.decidedAt,
  };
}

const changePayload = (c: PendingChange) => ({
  id: c.id,
  kind: c.kind,
  payload: c.payload,
  reason: c.reason,
  status: c.status,
  created_at: c.createdAt,
  decided_at: c.decidedAt,
});

export const createPortfolioService = (
  repo: Repo,
  market: ReturnType<typeof createMarketRepository>,
) => {
  /** Valida e grava só os campos conhecidos. Devolve os campos inválidos (nada é gravado se houver algum). */
  async function saveProfile(target: PortfolioQueries, userId: ULID, data: Record<string, unknown>) {
    const known = Object.entries(data).filter(([k]) => k in PROFILE_RULES);
    const errors = known.filter(([k, v]) => !PROFILE_RULES[k]![1](v)).map(([k]) => k);
    if (errors.length) return errors;

    await target.getProfile(userId);
    await target.updateProfile(
      userId,
      Object.fromEntries(
        known.map(([k, v]) => [PROFILE_RULES[k]![0], isNumberField(k) ? dec(v) : v]),
      ),
    );
    return [];
  }

  async function findAsset(ticker: unknown) {
    const asset = await market.findAssetByTicker(String(ticker).trim().toUpperCase());
    if (!asset) throw invalid(`ticker não está na base: ${ticker}`);
    return asset;
  }

  async function portfolio(userId: ULID) {
    const holdings = await repo.holdings(userId);
    const quotes = await market.latestQuotes(holdings.map((h) => h.asset.id));

    const valued = valuate(
      holdings.map(({ holding: h, asset }) => {
        const q = quotes.get(asset.id);
        const price = q?.price ?? null;

        return {
          ticker: asset.ticker,
          name: asset.name,
          sector: asset.sector,
          quantity: h.quantity,
          avg_price: h.avgPrice,
          price,
          change_pct: q?.changePct ?? null,
          gain_pct: price !== null && h.avgPrice ? price / h.avgPrice - 1 : null,
          source: q?.source ?? null,
          fetched_at: q?.fetchedAt ?? null,
        };
      }),
    );

    return {
      ...valued,
      exposure: { sector: exposureBySector(valued.positions) },
      profile: profilePayload(await repo.getProfile(userId)),
    };
  }

  async function proposalHeads(proposals: Proposal[]) {
    const items = await repo.proposalItems(proposals.map((p) => p.id));

    return proposals.map((p) => {
      const own = items.filter((i) => i.item.proposalId === p.id);
      return {
        head: {
          id: p.id,
          period: p.period,
          created_at: p.createdAt,
          status: proposalStatus(own.map((i) => i.item.decision)),
          count: own.length,
        },
        proposal: p,
        items: own,
      };
    });
  }

  async function itemPayloads(items: { item: ProposalItem; asset: Asset }[]) {
    const quotes = await market.latestQuotes(items.map((i) => i.asset.id));
    return items.map((i) => itemPayload(i.item, i.asset, quotes.get(i.asset.id)));
  }

  async function pendingChange(userId: ULID, id: ULID) {
    const change = await repo.findChange(userId, id);
    if (!change) throw new AppError("PENDING_CHANGE_NOT_FOUND");
    if (change.status !== "pendente") throw invalid("esta sugestão já foi decidida");
    return change;
  }

  return {
    portfolio,

    // ---- perfil ----

    async profile(userId: ULID) {
      return profilePayload(await repo.getProfile(userId));
    },

    async updateProfile(userId: ULID, data: Record<string, unknown>) {
      const errors = await saveProfile(repo, userId, data);
      if (errors.length) throw invalid(`campos inválidos: ${errors.join(", ")}`);

      return profilePayload(await repo.getProfile(userId));
    },

    // ---- posições ----

    async saveHolding(userId: ULID, ticker: string, quantity: unknown, avgPrice: unknown) {
      const asset = await market.findAssetByTicker(ticker.toUpperCase());
      if (!asset) throw new AppError("ASSET_NOT_FOUND");

      const qty = dec(quantity);
      const avg = dec(avgPrice);
      if (qty === null || qty <= 0 || (avg !== null && avg <= 0))
        throw invalid("quantidade deve ser maior que zero; preço médio, se informado, também");

      await repo.upsertHolding(userId, asset.id, qty, avg);
      return portfolio(userId);
    },

    async deleteHolding(userId: ULID, ticker: string) {
      const asset = await market.findAssetByTicker(ticker.toUpperCase());
      if (!asset) throw new AppError("ASSET_NOT_FOUND");

      await repo.deleteHolding(userId, asset.id);
    },

    // ---- propostas ----

    async proposals(userId: ULID) {
      return (await proposalHeads(await repo.proposals(userId))).map((p) => p.head);
    },

    async proposal(userId: ULID, id: ULID) {
      const found = await repo.findProposal(userId, id);
      if (!found) throw new AppError("PROPOSAL_NOT_FOUND");

      const [{ head, proposal, items }] = await proposalHeads([found]) as [Awaited<ReturnType<typeof proposalHeads>>[number]];
      const approved = items
        .filter((i) => i.item.decision !== "recusado")
        .reduce(
          (sum, { item }) =>
            sum + ((item.decision === "ajustado" ? item.adjustedWeight : item.targetWeight) ?? 0),
          0,
        );

      return {
        ...head,
        summary: proposal.summary,
        profile_snapshot: proposal.profileSnapshot,
        items: await itemPayloads(items),
        approved_weight: Math.round(approved * 1e6) / 1e6,
      };
    },

    /** A proposta mais recente com as decisões de cada item (para o Claude comparar com a próxima). */
    async latestProposal(userId: ULID) {
      const [latest] = await proposalHeads(await repo.proposals(userId, 1));
      if (!latest) return null;

      return {
        period: latest.proposal.period,
        summary: latest.proposal.summary,
        status: latest.head.status,
        created_at: latest.proposal.createdAt,
        items: await itemPayloads(latest.items),
      };
    },

    /** Grava rascunho. Qualquer problema rejeita a proposta inteira, com a lista completa. */
    async saveProposal(
      userId: ULID,
      period: string,
      summary: string,
      items: Record<string, unknown>[],
    ) {
      const parsed = items.map((it) => ({
        ...it,
        target_weight: dec(it.target_weight),
        ticker: String(it.ticker ?? "").trim().toUpperCase(),
      }));
      const assets = new Map(
        (
          await market.listAssets({
            tickers: parsed.map((it) => it.ticker),
            includeInactive: true,
          })
        ).map((a) => [a.ticker, a]),
      );

      const problems = validateProposal(parsed, new Set(assets.keys()));
      if (!String(period).trim() || !String(summary).trim())
        problems.unshift("período e resumo são obrigatórios");
      if (problems.length) throw invalid(problems.join("; "));

      const quotes = await market.latestQuotes([...assets.values()].map((a) => a.id));
      const profileSnapshot = profilePayload(await repo.getProfile(userId));

      const proposal = await repo.transaction((tx) =>
        tx.createProposal(
          { userId, period: period.trim(), summary: summary.trim(), profileSnapshot },
          parsed.map((raw) => {
            const it = raw as typeof raw & Record<"action" | "thesis" | "risks" | "invalidation", string>;
            const asset = assets.get(it.ticker)!;

            return {
              assetId: asset.id,
              action: it.action,
              targetWeight: it.target_weight!,
              thesis: it.thesis.trim(),
              risks: it.risks.trim(),
              invalidation: it.invalidation.trim(),
              sources: (raw as { sources?: unknown[] }).sources!.map(String),
              priceAtProposal: quotes.get(asset.id)?.price ?? null,
            };
          }),
        ),
      );

      return { id: proposal.id, status: "rascunho", review: `/carteira/propostas/${proposal.id}` };
    },

    /** Ação exclusiva do usuário (interface). Registra ou atualiza a tese no placar. */
    async decide(
      userId: ULID,
      itemId: ULID,
      decision: unknown,
      adjustedWeight: unknown,
      comment: unknown,
    ) {
      const found = await repo.findProposalItem(userId, itemId);
      if (!found) throw new AppError("PROPOSAL_ITEM_NOT_FOUND");

      if (!["aprovado", "recusado", "ajustado"].includes(decision as string))
        throw invalid("decisão deve ser aprovado, recusado ou ajustado");

      const weight = dec(adjustedWeight);
      if (decision === "ajustado" && (weight === null || weight < 0 || weight > 1))
        throw invalid("ajuste precisa de um novo peso entre 0 e 100%");

      const { item, asset } = found;
      const updated = await repo.transaction(async (tx) => {
        const row = await tx.decideItem(item.id, {
          decision: decision as string,
          adjustedWeight: decision === "ajustado" ? weight : null,
          comment: String(comment ?? "").trim(),
          decidedAt: new Date(),
        });

        await tx.upsertItemThesis({
          userId,
          proposalItemId: item.id,
          assetId: asset.id,
          summary: item.thesis,
          expectation: EXPECTATION[item.action] ?? "neutra",
          entryPrice: item.priceAtProposal,
          sources: item.sources,
          origin: "proposta",
          decision: decision as string,
        });
        return row;
      });

      return (await itemPayloads([{ item: updated, asset }]))[0]!;
    },

    // ---- placar ----

    /** Registra uma tese avulsa, com o preço atual como entrada. */
    async recordThesis(
      userId: ULID,
      ticker: string,
      summary: string,
      expectation: string,
      horizonDays: number | null,
      sources: string[],
    ) {
      const asset = await findAsset(ticker);
      if (!["alta", "baixa", "neutra"].includes(expectation))
        throw invalid("expectation deve ser alta, baixa ou neutra");
      if (!String(summary).trim() || !sources?.length)
        throw invalid("tese precisa de resumo e de ao menos uma fonte");

      const quote = (await market.latestQuotes([asset.id])).get(asset.id);
      const thesis = await repo.createThesis({
        userId,
        assetId: asset.id,
        summary: summary.trim(),
        expectation,
        entryPrice: quote?.price ?? null,
        horizonDays,
        sources,
      });

      return {
        id: thesis.id,
        ticker: asset.ticker,
        entry_price: thesis.entryPrice,
        created_at: thesis.createdAt,
      };
    },

    async scoreboard(userId: ULID) {
      const theses = await repo.theses(userId);
      const quotes = await market.latestQuotes(theses.map((t) => t.asset.id));

      const rows = theses.map(({ thesis: t, asset }) => {
        const q = quotes.get(asset.id);
        const current = q?.price ?? null;
        const ret = current !== null && t.entryPrice ? current / t.entryPrice - 1 : null;
        // retorno 0 = ainda sem movimento: não dá para julgar
        const hit = ret && t.expectation !== "neutra" ? (t.expectation === "alta" ? ret > 0 : ret < 0) : null;

        return {
          ticker: asset.ticker,
          summary: t.summary,
          expectation: t.expectation,
          origin: t.origin,
          decision: t.decision,
          entry_price: t.entryPrice,
          current_price: current,
          return_pct: ret,
          hit,
          created_at: t.createdAt,
          horizon_days: t.horizonDays,
          price_source: q?.source ?? null,
          price_fetched_at: q?.fetchedAt ?? null,
        };
      });

      const scored = rows.filter((r) => r.hit !== null);
      const hits = scored.filter((r) => r.hit).length;

      return { rows, scored: scored.length, hits, hit_rate: scored.length ? hits / scored.length : null };
    },

    // ---- alertas ----

    async alerts(userId: ULID, unseenOnly = false, limit = 100) {
      return (await repo.alerts(userId, { unseenOnly, limit })).map(({ alert: a, ticker }) => ({
        id: a.id,
        kind: a.kind,
        title: a.title,
        ticker,
        detail: a.detail,
        created_on: a.createdOn,
        seen: a.seen,
      }));
    },

    async markAlertSeen(userId: ULID, id: ULID) {
      await repo.markAlertSeen(userId, id);
    },

    /** Avalia os gatilhos sobre a carteira do usuário e grava alertas novos. Devolve quantos foram criados. */
    async runAlerts(userId: ULID, today = todayInBrazil()) {
      const [profile, port, holdings, known] = await Promise.all([
        repo.getProfile(userId),
        portfolio(userId),
        repo.holdings(userId),
        repo.filingAlertKeys(userId),
      ]);
      const held = new Map(holdings.map((h) => [h.asset.ticker, h.asset.id]));

      const recent = await market.news({
        kind: "fato_relevante",
        assetIds: [...held.values()],
        since: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        limit: 200,
      });
      const linked = await market.newsTickers(recent.map((n) => n.id));
      const filings = recent
        .filter((n) => !known.has(`fato_relevante:${n.url}`))
        .flatMap((n) =>
          (linked.get(n.id) ?? [])
            .filter((ticker) => held.has(ticker))
            .map((ticker) => ({ ticker, title: n.title, url: n.url })),
        );

      const found = triggers(
        port.positions,
        port.exposure.sector,
        {
          dailyDropPct: profile.alertDailyDropPct,
          maxAssetWeight: profile.alertMaxAssetWeight,
          maxSectorWeight: profile.alertMaxSectorWeight,
        },
        filings,
      );

      let created = 0;
      for (const t of found) {
        const isNew = await repo.createAlert({
          userId,
          kind: t.kind,
          key: t.key,
          title: t.title.slice(0, 500),
          assetId: (t.ticker && held.get(t.ticker)) || null,
          detail: t.detail,
          createdOn: today,
        });
        if (isNew) created++;
      }
      return created;
    },

    /** Roda os alertas de todo usuário que tem carteira. */
    async runAllAlerts() {
      let created = 0;
      for (const userId of await repo.usersWithHoldings()) created += await this.runAlerts(userId);
      return created;
    },

    // ---- Sugestões do Claude: ele propõe, o usuário aplica ou recusa na interface ----

    async pendingChanges(userId: ULID) {
      return (await repo.pendingChanges(userId)).map(changePayload);
    },

    /** quantity 0 = remover a posição. */
    async proposeHoldingChange(
      userId: ULID,
      ticker: string,
      quantity: unknown,
      avgPrice: unknown,
      reason: string,
    ) {
      const asset = await findAsset(ticker);
      const qty = dec(quantity);
      const avg = dec(avgPrice);

      if (qty === null || qty < 0 || (avg !== null && avg <= 0))
        throw invalid("quantidade deve ser 0 (remover) ou positiva; preço médio, se informado, positivo");
      if (qty === 0 && !(await repo.hasHolding(userId, asset.id)))
        throw invalid(`${asset.ticker} não está na carteira para ser removida`);
      if (!String(reason).trim()) throw invalid("explique o motivo da sugestão");

      return changePayload(
        await repo.createChange({
          userId,
          kind: "holding",
          reason: reason.trim(),
          payload: { ticker: asset.ticker, quantity: qty, avg_price: avg },
        }),
      );
    },

    async proposeProfileChange(userId: ULID, changes: Record<string, unknown>, reason: string) {
      const keys = Object.keys(changes ?? {});
      const unknown = keys.filter((k) => !(k in PROFILE_RULES));
      const bad = keys.filter((k) => k in PROFILE_RULES && !PROFILE_RULES[k]![1](changes[k]));

      if (!keys.length || unknown.length || bad.length)
        throw invalid(
          `mudança de perfil inválida; desconhecidos: [${unknown.join(", ")}], inválidos: [${bad.join(", ")}]`,
        );
      if (!String(reason).trim()) throw invalid("explique o motivo da sugestão");

      return changePayload(
        await repo.createChange({ userId, kind: "profile", payload: changes, reason: reason.trim() }),
      );
    },

    /** Ação exclusiva do usuário. Revalida no momento de aplicar: os dados podem ter mudado desde a sugestão. */
    async applyChange(userId: ULID, id: ULID) {
      const change = await pendingChange(userId, id);

      return changePayload(
        await repo.transaction(async (tx) => {
          if (change.kind === "holding") {
            const asset = await findAsset(change.payload.ticker);
            const qty = dec(change.payload.quantity);

            if (!qty) await tx.deleteHolding(userId, asset.id);
            else await tx.upsertHolding(userId, asset.id, qty, dec(change.payload.avg_price));
          } else {
            const errors = await saveProfile(tx, userId, change.payload);
            if (errors.length) throw invalid(`campos inválidos: ${errors.join(", ")}`);
          }

          return tx.decideChange(change.id, "aplicada");
        }),
      );
    },

    async rejectChange(userId: ULID, id: ULID) {
      const change = await pendingChange(userId, id);
      return changePayload(await repo.decideChange(change.id, "recusada"));
    },
  };
};
