import {
  boolean,
  char,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  uniqueIndex,
  index,
  varchar,
} from "drizzle-orm/pg-core";
import { foreignId, id } from "../../columns.helpers.js";
import type { ULID } from "../../../domain/shared/id.js";
import { users } from "../identity/users.js";
import { invAssets, instant, money } from "./market.js";

// Carteira: cada linha pertence a um usuário do LedgerLouis.

// fração: 0.250000 = 25%
const weight = (name: string) => numeric(name, { precision: 7, scale: 6, mode: "number" });
const userRef = () => foreignId("user_id", () => users.id).notNull();
const assetRef = () => foreignId("asset_id", () => invAssets.id);

// Uma linha por usuário. Nada é assumido: campos vazios ficam vazios e a proposta avisa.
export const invProfiles = pgTable(
  "inv_profiles",
  {
    id,
    userId: userRef(),
    horizonYears: smallint("horizon_years"),
    // "", "conservador", "moderado" ou "arrojado"
    riskTolerance: varchar("risk_tolerance", { length: 20 }).notNull().default(""),
    monthlyContribution: money("monthly_contribution"),
    avoidSectors: jsonb("avoid_sectors").$type<string[]>().notNull().default([]),
    notes: text("notes").notNull().default(""),
    // limiares dos alertas, editáveis
    alertDailyDropPct: numeric("alert_daily_drop_pct", { precision: 6, scale: 2, mode: "number" })
      .notNull()
      .default(5),
    alertMaxAssetWeight: weight("alert_max_asset_weight").notNull().default(0.2),
    alertMaxSectorWeight: weight("alert_max_sector_weight").notNull().default(0.35),
    updatedAt: instant("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_inv_profiles_user").on(t.userId)],
);

export const invHoldings = pgTable(
  "inv_holdings",
  {
    id,
    userId: userRef(),
    assetId: assetRef().notNull(),
    quantity: numeric("quantity", { precision: 20, scale: 6, mode: "number" }).notNull(),
    avgPrice: money("avg_price"),
    updatedAt: instant("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_inv_holdings_user_asset").on(t.userId, t.assetId)],
);

export const invProposals = pgTable(
  "inv_proposals",
  {
    id,
    userId: userRef(),
    // ex.: "2026-11"
    period: varchar("period", { length: 20 }).notNull(),
    summary: text("summary").notNull(),
    profileSnapshot: jsonb("profile_snapshot").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: instant("created_at").notNull().defaultNow(),
  },
  (t) => [index("ix_inv_proposals_user").on(t.userId, t.createdAt.desc())],
);

export const invProposalItems = pgTable("inv_proposal_items", {
  id,
  proposalId: char("proposal_id", { length: 26 })
    .$type<ULID>()
    .notNull()
    .references(() => invProposals.id, { onDelete: "cascade" }),
  assetId: assetRef().notNull(),
  // entrar, sair, aumentar, reduzir ou manter
  action: varchar("action", { length: 20 }).notNull(),
  targetWeight: weight("target_weight").notNull(),
  thesis: text("thesis").notNull(),
  risks: text("risks").notNull(),
  invalidation: text("invalidation").notNull(),
  sources: jsonb("sources").$type<string[]>().notNull().default([]),
  priceAtProposal: money("price_at_proposal"),
  // pendente, aprovado, recusado ou ajustado
  decision: varchar("decision", { length: 20 }).notNull().default("pendente"),
  adjustedWeight: weight("adjusted_weight"),
  comment: text("comment").notNull().default(""),
  decidedAt: instant("decided_at"),
});

// Entrada do placar: o que se esperava, a que preço e quando. Avaliada contra o preço atual.
export const invTheses = pgTable(
  "inv_theses",
  {
    id,
    userId: userRef(),
    assetId: assetRef().notNull(),
    summary: text("summary").notNull(),
    // alta, baixa ou neutra
    expectation: varchar("expectation", { length: 10 }).notNull(),
    entryPrice: money("entry_price"),
    horizonDays: integer("horizon_days"),
    sources: jsonb("sources").$type<string[]>().notNull().default([]),
    // "proposta" ou "avulsa"
    origin: varchar("origin", { length: 20 }).notNull().default("avulsa"),
    decision: varchar("decision", { length: 20 }).notNull().default(""),
    proposalItemId: char("proposal_item_id", { length: 26 })
      .$type<ULID>()
      .references(() => invProposalItems.id, { onDelete: "cascade" }),
    createdAt: instant("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_inv_theses_proposal_item").on(t.proposalItemId)],
);

export const invAlerts = pgTable(
  "inv_alerts",
  {
    id,
    userId: userRef(),
    kind: varchar("kind", { length: 30 }).notNull(),
    // identifica o mesmo gatilho para não repetir no mesmo dia
    key: varchar("key", { length: 700 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    assetId: char("asset_id", { length: 26 })
      .$type<ULID>()
      .references(() => invAssets.id, { onDelete: "cascade" }),
    detail: jsonb("detail").$type<Record<string, unknown>>().notNull().default({}),
    createdOn: date("created_on", { mode: "string" }).notNull(),
    createdAt: instant("created_at").notNull().defaultNow(),
    seen: boolean("seen").notNull().default(false),
  },
  (t) => [uniqueIndex("uq_inv_alerts_per_day").on(t.userId, t.key, t.createdOn)],
);

// Sugestão do Claude para a carteira ou o perfil. Só vale depois que o usuário aplica na interface.
export const invPendingChanges = pgTable("inv_pending_changes", {
  id,
  userId: userRef(),
  // "holding" ou "profile"
  kind: varchar("kind", { length: 20 }).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  reason: text("reason").notNull(),
  // pendente, aplicada ou recusada
  status: varchar("status", { length: 20 }).notNull().default("pendente"),
  createdAt: instant("created_at").notNull().defaultNow(),
  decidedAt: instant("decided_at"),
});

// O que está aberto no dashboard agora (uma linha por usuário). Lido pelo servidor MCP, que é outro processo.
export const invScreenContexts = pgTable(
  "inv_screen_contexts",
  {
    id,
    userId: userRef(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    updatedAt: instant("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_inv_screen_contexts_user").on(t.userId)],
);

// Pedido do Claude para o dashboard (ex.: abrir uma tela). O frontend consulta os novos e executa.
export const invScreenCommands = pgTable(
  "inv_screen_commands",
  {
    id,
    userId: userRef(),
    action: varchar("action", { length: 30 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: instant("created_at").notNull().defaultNow(),
  },
  (t) => [index("ix_inv_screen_commands_user").on(t.userId, t.id)],
);
