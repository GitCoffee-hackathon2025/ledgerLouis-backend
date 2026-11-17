import {
  and,
  desc,
  eq,
  gt,
  gte,
  inArray,
  max,
  notLike,
  sql,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import type { DB } from "../../../types/db.js";
import type { ULID } from "../../../domain/shared/id.js";
import {
  invAssets,
  invFundamentals,
  invMacroPoints,
  invNewsFeeds,
  invNewsItemAssets,
  invNewsItems,
  invNicheAssets,
  invNiches,
  invPriceBars,
  invQuotes,
  invScreenCommands,
  invScreenContexts,
} from "../../../database/schemas/index.js";
import type { Bar, MacroData } from "../../../infrastructure/market-data/types.js";

export type Asset = InferSelectModel<typeof invAssets>;
export type Quote = InferSelectModel<typeof invQuotes>;
export type Fundamentals = InferSelectModel<typeof invFundamentals>;
export type NewsItem = InferSelectModel<typeof invNewsItems>;
export type NewsFeed = InferSelectModel<typeof invNewsFeeds>;

export interface AssetFilter {
  market?: "B3" | "US";
  sector?: string;
  tickers?: string[];
  includeInactive?: boolean;
}

const byAsset = <T extends { assetId: ULID }>(rows: T[]) =>
  new Map(rows.map((r) => [r.assetId, r]));

export const createMarketRepository = (db: DB) => ({
  // ---- ativos ----

  async listAssets(f: AssetFilter = {}) {
    return db
      .select()
      .from(invAssets)
      .where(
        and(
          f.includeInactive ? undefined : eq(invAssets.active, true),
          f.market && eq(invAssets.market, f.market),
          f.sector !== undefined ? eq(invAssets.sector, f.sector) : undefined,
          f.tickers && inArray(invAssets.ticker, f.tickers),
        ),
      )
      .orderBy(invAssets.ticker);
  },

  async findAssetByTicker(ticker: string) {
    return db.query.invAssets.findFirst({
      where: (t, { eq }) => eq(t.ticker, ticker),
    });
  },

  async upsertAsset(data: InferInsertModel<typeof invAssets>) {
    const { ticker, ...rest } = data;
    const [row] = await db
      .insert(invAssets)
      .values(data)
      .onConflictDoUpdate({ target: invAssets.ticker, set: rest })
      .returning();
    return row!;
  },

  /** CNPJ já preenchido tem prioridade; o cadastro da CVM só completa os vazios. */
  async fillCnpj(tickers: string[], cnpj: string) {
    await db
      .update(invAssets)
      .set({ cnpj })
      .where(and(inArray(invAssets.ticker, tickers), eq(invAssets.cnpj, "")));
  },

  // ---- cotações, fundamentos e candles ----

  /** Última cotação de cada ativo pedido. */
  async latestQuotes(assetIds: ULID[]) {
    return byAsset(
      await db
        .selectDistinctOn([invQuotes.assetId])
        .from(invQuotes)
        .where(inArray(invQuotes.assetId, assetIds))
        .orderBy(invQuotes.assetId, desc(invQuotes.fetchedAt)),
    );
  },

  async latestFundamentals(assetIds: ULID[]) {
    return byAsset(
      await db
        .selectDistinctOn([invFundamentals.assetId])
        .from(invFundamentals)
        .where(inArray(invFundamentals.assetId, assetIds))
        .orderBy(invFundamentals.assetId, desc(invFundamentals.fetchedAt)),
    );
  },

  async hasFreshQuote(source: string, since: Date) {
    const [row] = await db
      .select({ id: invQuotes.id })
      .from(invQuotes)
      .where(and(eq(invQuotes.source, source), gte(invQuotes.fetchedAt, since)))
      .limit(1);
    return Boolean(row);
  },

  async insertQuote(data: InferInsertModel<typeof invQuotes>) {
    await db.insert(invQuotes).values(data);
  },

  async insertFundamentals(data: InferInsertModel<typeof invFundamentals>) {
    await db.insert(invFundamentals).values(data);
  },

  async bars(assetId: ULID) {
    return db
      .select()
      .from(invPriceBars)
      .where(eq(invPriceBars.assetId, assetId))
      .orderBy(invPriceBars.date);
  },

  /** Quando os candles de cada ativo foram buscados pela última vez. */
  async lastBarFetch() {
    const rows = await db
      .select({ assetId: invPriceBars.assetId, at: max(invPriceBars.fetchedAt) })
      .from(invPriceBars)
      .groupBy(invPriceBars.assetId);
    return new Map(rows.map((r) => [r.assetId, r.at]));
  },

  async upsertBars(assetId: ULID, bars: Bar[], source: string, fetchedAt: Date) {
    if (!bars.length) return;

    await db
      .insert(invPriceBars)
      .values(bars.map((b) => ({ ...b, assetId, source, fetchedAt })))
      .onConflictDoUpdate({
        target: [invPriceBars.assetId, invPriceBars.date],
        set: {
          open: sql`excluded.open`,
          high: sql`excluded.high`,
          low: sql`excluded.low`,
          close: sql`excluded.close`,
          volume: sql`excluded.volume`,
          source: sql`excluded.source`,
          fetchedAt: sql`excluded.fetched_at`,
        },
      });
  },

  /** Fechamentos das ações ativas da B3, do mais novo para o mais antigo, para os minigráficos. */
  async recentCloses() {
    return db
      .select({ ticker: invAssets.ticker, close: invPriceBars.close })
      .from(invPriceBars)
      .innerJoin(invAssets, eq(invAssets.id, invPriceBars.assetId))
      .where(and(eq(invAssets.active, true), eq(invAssets.market, "B3")))
      .orderBy(invAssets.ticker, desc(invPriceBars.date));
  },

  // ---- macro ----

  /** Última leitura de cada série. */
  async latestMacro(codes?: string[]) {
    return db
      .selectDistinctOn([invMacroPoints.code])
      .from(invMacroPoints)
      .where(codes && inArray(invMacroPoints.code, codes))
      .orderBy(invMacroPoints.code, desc(invMacroPoints.date));
  },

  async hasFreshMacro(code: string, since: Date) {
    const [row] = await db
      .select({ id: invMacroPoints.id })
      .from(invMacroPoints)
      .where(and(eq(invMacroPoints.code, code), gte(invMacroPoints.fetchedAt, since)))
      .limit(1);
    return Boolean(row);
  },

  async upsertMacro(
    series: { code: string; name: string; unit: string; source: string },
    points: MacroData[],
    fetchedAt: Date,
  ) {
    if (!points.length) return;

    await db
      .insert(invMacroPoints)
      .values(points.map((p) => ({ ...series, ...p, fetchedAt })))
      .onConflictDoUpdate({
        target: [invMacroPoints.code, invMacroPoints.date],
        set: {
          name: sql`excluded.name`,
          unit: sql`excluded.unit`,
          value: sql`excluded.value`,
          source: sql`excluded.source`,
          fetchedAt: sql`excluded.fetched_at`,
        },
      });
  },

  // ---- nichos ----

  async listNiches() {
    return db
      .select()
      .from(invNiches)
      .where(eq(invNiches.external, false))
      .orderBy(invNiches.name);
  },

  async findNicheBySlug(slug: string) {
    return db.query.invNiches.findFirst({ where: (t, { eq }) => eq(t.slug, slug) });
  },

  /** Ativos (só os ativos) de cada nicho pedido. */
  async nicheAssets(nicheIds: ULID[]) {
    return db
      .select({ nicheId: invNicheAssets.nicheId, asset: invAssets })
      .from(invNicheAssets)
      .innerJoin(invAssets, eq(invAssets.id, invNicheAssets.assetId))
      .where(and(inArray(invNicheAssets.nicheId, nicheIds), eq(invAssets.active, true)))
      .orderBy(invAssets.ticker);
  },

  async nichesOfAsset(assetId: ULID) {
    return db
      .select({ slug: invNiches.slug, name: invNiches.name })
      .from(invNicheAssets)
      .innerJoin(invNiches, eq(invNiches.id, invNicheAssets.nicheId))
      .where(eq(invNicheAssets.assetId, assetId))
      .orderBy(invNiches.name);
  },

  /** Cria o nicho se o slug ainda não existe; nunca sobrescreve o que foi editado depois. */
  async getOrCreateNiche(data: InferInsertModel<typeof invNiches>) {
    await db.insert(invNiches).values(data).onConflictDoNothing();
    return (await this.findNicheBySlug(data.slug))!;
  },

  async linkNicheAssets(nicheId: ULID, assetIds: ULID[]) {
    if (!assetIds.length) return;

    await db
      .insert(invNicheAssets)
      .values(assetIds.map((assetId) => ({ nicheId, assetId })))
      .onConflictDoNothing();
  },

  // ---- notícias ----

  /** Notícias mais recentes, com filtros opcionais por ativos ligados, fontes e tipo. */
  async news(f: { assetIds?: ULID[]; sources?: string[]; kind?: string; since?: Date; limit: number }) {
    const linked =
      f.assetIds &&
      inArray(
        invNewsItems.id,
        db
          .select({ id: invNewsItemAssets.newsItemId })
          .from(invNewsItemAssets)
          .where(inArray(invNewsItemAssets.assetId, f.assetIds)),
      );

    return db
      .select()
      .from(invNewsItems)
      .where(
        and(
          linked,
          f.sources && inArray(invNewsItems.source, f.sources),
          f.kind ? eq(invNewsItems.kind, f.kind) : undefined,
          f.since && gte(invNewsItems.publishedAt, f.since),
        ),
      )
      .orderBy(desc(invNewsItems.publishedAt))
      .limit(f.limit);
  },

  /** Tickers ligados a cada notícia. */
  async newsTickers(newsIds: ULID[]) {
    const rows = await db
      .select({ newsItemId: invNewsItemAssets.newsItemId, ticker: invAssets.ticker })
      .from(invNewsItemAssets)
      .innerJoin(invAssets, eq(invAssets.id, invNewsItemAssets.assetId))
      .where(inArray(invNewsItemAssets.newsItemId, newsIds));

    const out = new Map<ULID, string[]>();
    for (const r of rows) out.set(r.newsItemId, [...(out.get(r.newsItemId) ?? []), r.ticker]);
    return out;
  },

  /** Grava a notícia se a URL for nova e liga os ativos. Nunca duplica. */
  async saveNews(data: InferInsertModel<typeof invNewsItems>, assetIds: ULID[]) {
    await db.insert(invNewsItems).values(data).onConflictDoNothing();
    if (!assetIds.length) return;

    const [item] = await db
      .select({ id: invNewsItems.id })
      .from(invNewsItems)
      .where(eq(invNewsItems.url, data.url));

    await db
      .insert(invNewsItemAssets)
      .values(assetIds.map((assetId) => ({ newsItemId: item!.id, assetId })))
      .onConflictDoNothing();
  },

  async feedNamesByCategory(category: string) {
    const rows = await db
      .select({ name: invNewsFeeds.name })
      .from(invNewsFeeds)
      .where(eq(invNewsFeeds.category, category));
    return rows.map((r) => r.name);
  },

  /** Feeds RSS ativos (o da CVM tem coleta própria). */
  async rssFeeds(cvmBase: string) {
    return db
      .select()
      .from(invNewsFeeds)
      .where(and(eq(invNewsFeeds.active, true), notLike(invNewsFeeds.url, `${cvmBase}%`)));
  },

  /** Devolve o feed e se ele acabou de ser criado. */
  async getOrCreateFeed(data: InferInsertModel<typeof invNewsFeeds>) {
    const created = await db
      .insert(invNewsFeeds)
      .values(data)
      .onConflictDoNothing()
      .returning();
    const [feed] = created.length
      ? created
      : await db.select().from(invNewsFeeds).where(eq(invNewsFeeds.url, data.url));

    return { feed: feed!, created: created.length > 0 };
  },

  async touchFeed(id: ULID, fetchedAt: Date) {
    await db.update(invNewsFeeds).set({ fetchedAt }).where(eq(invNewsFeeds.id, id));
  },

  // ---- tela aberta e comandos do Claude ----

  async getScreenContext(userId: ULID) {
    return db.query.invScreenContexts.findFirst({
      where: (t, { eq }) => eq(t.userId, userId),
    });
  },

  async setScreenContext(userId: ULID, payload: Record<string, unknown>) {
    const updatedAt = new Date();
    await db
      .insert(invScreenContexts)
      .values({ userId, payload, updatedAt })
      .onConflictDoUpdate({
        target: invScreenContexts.userId,
        set: { payload, updatedAt },
      });
  },

  async createScreenCommand(userId: ULID, action: string, payload: Record<string, unknown>) {
    const [row] = await db
      .insert(invScreenCommands)
      .values({ userId, action, payload })
      .returning();
    return row!;
  },

  async lastScreenCommandId(userId: ULID) {
    const [row] = await db
      .select({ id: max(invScreenCommands.id) })
      .from(invScreenCommands)
      .where(eq(invScreenCommands.userId, userId));
    return row?.id ?? null;
  },

  /** IDs são ULID: a ordem alfabética é a ordem de criação. */
  async screenCommandsAfter(userId: ULID, after: string) {
    return db
      .select()
      .from(invScreenCommands)
      .where(and(eq(invScreenCommands.userId, userId), gt(invScreenCommands.id, after as ULID)))
      .orderBy(invScreenCommands.id)
      .limit(20);
  },
});
