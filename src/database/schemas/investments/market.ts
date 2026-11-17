import {
  boolean,
  char,
  date,
  index,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { id } from "../../columns.helpers.js";
import type { ULID } from "../../../domain/shared/id.js";

// Dados de mercado: compartilhados por todos os usuários.

export const money = (name: string) => numeric(name, { precision: 24, scale: 4, mode: "number" });
const ratio = (name: string) => numeric(name, { precision: 18, scale: 8, mode: "number" });
export const instant = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

// Histórico de um ativo some junto com ele
export const assetRef = () =>
  char("asset_id", { length: 26 })
    .$type<ULID>()
    .notNull()
    .references(() => invAssets.id, { onDelete: "cascade" });

export const invAssets = pgTable(
  "inv_assets",
  {
    id,
    ticker: varchar("ticker", { length: 16 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    kind: varchar("kind", { length: 20 }).notNull().default("stock"),
    market: varchar("market", { length: 2 }).$type<"B3" | "US">().notNull().default("B3"),
    sector: varchar("sector", { length: 100 }).notNull().default(""),
    subsector: varchar("subsector", { length: 100 }).notNull().default(""),
    logoUrl: varchar("logo_url", { length: 500 }).notNull().default(""),
    // liga fatos relevantes da CVM
    cnpj: varchar("cnpj", { length: 18 }).notNull().default(""),
    // nomes alternativos para casar notícia (ex.: "Amazon")
    aliases: jsonb("aliases").$type<string[]>().notNull().default([]),
    active: boolean("active").notNull().default(true),
  },
  (t) => [
    uniqueIndex("uq_inv_assets_ticker").on(t.ticker),
    index("ix_inv_assets_cnpj").on(t.cnpj),
  ],
);

export const invQuotes = pgTable(
  "inv_quotes",
  {
    id,
    assetId: assetRef(),
    price: money("price"),
    // em pontos percentuais, como a fonte entrega (1.5 = +1,5%)
    changePct: ratio("change_pct"),
    volume: money("volume"),
    marketCap: money("market_cap"),
    source: varchar("source", { length: 50 }).notNull(),
    fetchedAt: instant("fetched_at").notNull(),
  },
  (t) => [index("ix_inv_quotes_latest").on(t.assetId, t.fetchedAt.desc())],
);

export const invFundamentals = pgTable(
  "inv_fundamentals",
  {
    id,
    assetId: assetRef(),
    revenue: money("revenue"),
    ebitda: money("ebitda"),
    totalDebt: money("total_debt"),
    totalCash: money("total_cash"),
    eps: ratio("eps"),
    // fração (0.18 = 18%)
    roeReported: ratio("roe_reported"),
    source: varchar("source", { length: 50 }).notNull(),
    fetchedAt: instant("fetched_at").notNull(),
  },
  (t) => [index("ix_inv_fundamentals_latest").on(t.assetId, t.fetchedAt.desc())],
);

export const invMacroPoints = pgTable(
  "inv_macro_points",
  {
    id,
    code: varchar("code", { length: 30 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    unit: varchar("unit", { length: 20 }).notNull(),
    date: date("date", { mode: "string" }).notNull(),
    value: numeric("value", { precision: 18, scale: 6, mode: "number" }).notNull(),
    source: varchar("source", { length: 50 }).notNull(),
    fetchedAt: instant("fetched_at").notNull(),
  },
  (t) => [uniqueIndex("uq_inv_macro_point").on(t.code, t.date)],
);

// Grupo temático (ex.: IA e tecnologia), atravessando setores e países.
export const invNiches = pgTable(
  "inv_niches",
  {
    id,
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 50 }).notNull(),
    description: text("description").notNull().default(""),
    // códigos de macro relevantes
    macroCodes: jsonb("macro_codes").$type<string[]>().notNull().default([]),
    // fora de "/grupos": a tela própria busca pelo slug direto
    external: boolean("external").notNull().default(false),
  },
  (t) => [
    uniqueIndex("uq_inv_niches_name").on(t.name),
    uniqueIndex("uq_inv_niches_slug").on(t.slug),
  ],
);

export const invNicheAssets = pgTable(
  "inv_niche_assets",
  {
    nicheId: char("niche_id", { length: 26 })
      .$type<ULID>()
      .notNull()
      .references(() => invNiches.id, { onDelete: "cascade" }),
    assetId: assetRef(),
  },
  (t) => [primaryKey({ columns: [t.nicheId, t.assetId] })],
);

export const invNewsFeeds = pgTable(
  "inv_news_feeds",
  {
    id,
    name: varchar("name", { length: 100 }).notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    // "ticker", "geopolitica" ou "ia_bolha"
    category: varchar("category", { length: 20 }).notNull().default("ticker"),
    active: boolean("active").notNull().default(true),
    fetchedAt: instant("fetched_at"),
  },
  (t) => [uniqueIndex("uq_inv_news_feeds_url").on(t.url)],
);

// Só título, link, fonte e data: nunca o texto da matéria.
export const invNewsItems = pgTable(
  "inv_news_items",
  {
    id,
    title: varchar("title", { length: 500 }).notNull(),
    url: varchar("url", { length: 600 }).notNull(),
    source: varchar("source", { length: 100 }).notNull(),
    // "fato_relevante", "comunicado" ou "noticia"
    kind: varchar("kind", { length: 40 }).notNull(),
    publishedAt: instant("published_at").notNull(),
  },
  (t) => [
    uniqueIndex("uq_inv_news_items_url").on(t.url),
    index("ix_inv_news_items_published").on(t.publishedAt),
  ],
);

export const invNewsItemAssets = pgTable(
  "inv_news_item_assets",
  {
    newsItemId: char("news_item_id", { length: 26 })
      .$type<ULID>()
      .notNull()
      .references(() => invNewsItems.id, { onDelete: "cascade" }),
    assetId: assetRef(),
  },
  (t) => [primaryKey({ columns: [t.newsItemId, t.assetId] })],
);

// Candle diário. O plano gratuito da brapi cobre cerca de 3 meses.
export const invPriceBars = pgTable(
  "inv_price_bars",
  {
    id,
    assetId: assetRef(),
    date: date("date", { mode: "string" }).notNull(),
    open: money("open"),
    high: money("high"),
    low: money("low"),
    close: money("close"),
    volume: money("volume"),
    source: varchar("source", { length: 50 }).notNull(),
    fetchedAt: instant("fetched_at").notNull(),
  },
  (t) => [uniqueIndex("uq_inv_price_bar_day").on(t.assetId, t.date)],
);
