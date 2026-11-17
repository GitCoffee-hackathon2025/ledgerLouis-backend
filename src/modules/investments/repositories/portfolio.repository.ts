import {
  and,
  desc,
  eq,
  inArray,
  like,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import type { DB } from "../../../types/db.js";
import type { ULID } from "../../../domain/shared/id.js";
import {
  invAlerts,
  invAssets,
  invHoldings,
  invPendingChanges,
  invProfiles,
  invProposalItems,
  invProposals,
  invTheses,
} from "../../../database/schemas/index.js";

export type Profile = InferSelectModel<typeof invProfiles>;
export type ProfileUpdate = Partial<
  Omit<InferInsertModel<typeof invProfiles>, "id" | "userId" | "updatedAt">
>;
export type Proposal = InferSelectModel<typeof invProposals>;
export type ProposalItem = InferSelectModel<typeof invProposalItems>;
export type PendingChange = InferSelectModel<typeof invPendingChanges>;
type NewItem = Omit<InferInsertModel<typeof invProposalItems>, "id" | "proposalId">;

const queries = (db: DB) => ({
  // ---- perfil ----

  /** Cria a linha do usuário na primeira leitura. */
  async getProfile(userId: ULID) {
    await db.insert(invProfiles).values({ userId }).onConflictDoNothing();
    const [row] = await db.select().from(invProfiles).where(eq(invProfiles.userId, userId));
    return row!;
  },

  async updateProfile(userId: ULID, data: ProfileUpdate) {
    await db
      .update(invProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invProfiles.userId, userId));
  },

  // ---- posições ----

  async holdings(userId: ULID) {
    return db
      .select({ holding: invHoldings, asset: invAssets })
      .from(invHoldings)
      .innerJoin(invAssets, eq(invAssets.id, invHoldings.assetId))
      .where(eq(invHoldings.userId, userId))
      .orderBy(invAssets.ticker);
  },

  async hasHolding(userId: ULID, assetId: ULID) {
    const [row] = await db
      .select({ id: invHoldings.id })
      .from(invHoldings)
      .where(and(eq(invHoldings.userId, userId), eq(invHoldings.assetId, assetId)));
    return Boolean(row);
  },

  async upsertHolding(userId: ULID, assetId: ULID, quantity: number, avgPrice: number | null) {
    const updatedAt = new Date();
    await db
      .insert(invHoldings)
      .values({ userId, assetId, quantity, avgPrice, updatedAt })
      .onConflictDoUpdate({
        target: [invHoldings.userId, invHoldings.assetId],
        set: { quantity, avgPrice, updatedAt },
      });
  },

  async deleteHolding(userId: ULID, assetId: ULID) {
    await db
      .delete(invHoldings)
      .where(and(eq(invHoldings.userId, userId), eq(invHoldings.assetId, assetId)));
  },

  async usersWithHoldings() {
    const rows = await db.selectDistinct({ userId: invHoldings.userId }).from(invHoldings);
    return rows.map((r) => r.userId);
  },

  // ---- propostas ----

  async proposals(userId: ULID, limit?: number) {
    const query = db
      .select()
      .from(invProposals)
      .where(eq(invProposals.userId, userId))
      .orderBy(desc(invProposals.createdAt));
    return limit ? query.limit(limit) : query;
  },

  async findProposal(userId: ULID, id: ULID) {
    const [row] = await db
      .select()
      .from(invProposals)
      .where(and(eq(invProposals.id, id), eq(invProposals.userId, userId)));
    return row;
  },

  /** Itens (com o ativo) das propostas pedidas, do maior peso alvo para o menor. */
  async proposalItems(proposalIds: ULID[]) {
    return db
      .select({ item: invProposalItems, asset: invAssets })
      .from(invProposalItems)
      .innerJoin(invAssets, eq(invAssets.id, invProposalItems.assetId))
      .where(inArray(invProposalItems.proposalId, proposalIds))
      .orderBy(desc(invProposalItems.targetWeight));
  },

  /** Item de proposta, só se a proposta for do usuário. */
  async findProposalItem(userId: ULID, itemId: ULID) {
    const [row] = await db
      .select({ item: invProposalItems, asset: invAssets })
      .from(invProposalItems)
      .innerJoin(invProposals, eq(invProposals.id, invProposalItems.proposalId))
      .innerJoin(invAssets, eq(invAssets.id, invProposalItems.assetId))
      .where(and(eq(invProposalItems.id, itemId), eq(invProposals.userId, userId)));
    return row;
  },

  async createProposal(
    head: Omit<InferInsertModel<typeof invProposals>, "id">,
    items: NewItem[],
  ) {
    const [proposal] = await db.insert(invProposals).values(head).returning();
    await db
      .insert(invProposalItems)
      .values(items.map((it) => ({ ...it, proposalId: proposal!.id })));
    return proposal!;
  },

  async decideItem(
    itemId: ULID,
    data: Pick<ProposalItem, "decision" | "adjustedWeight" | "comment" | "decidedAt">,
  ) {
    const [row] = await db
      .update(invProposalItems)
      .set(data)
      .where(eq(invProposalItems.id, itemId))
      .returning();
    return row!;
  },

  // ---- placar ----

  async theses(userId: ULID) {
    return db
      .select({ thesis: invTheses, asset: invAssets })
      .from(invTheses)
      .innerJoin(invAssets, eq(invAssets.id, invTheses.assetId))
      .where(eq(invTheses.userId, userId))
      .orderBy(desc(invTheses.createdAt));
  },

  async createThesis(data: Omit<InferInsertModel<typeof invTheses>, "id">) {
    const [row] = await db.insert(invTheses).values(data).returning();
    return row!;
  },

  /** Uma tese por item de proposta: decidir de novo atualiza a mesma linha. */
  async upsertItemThesis(data: Omit<InferInsertModel<typeof invTheses>, "id" | "createdAt">) {
    const { userId, proposalItemId, ...rest } = data;
    await db
      .insert(invTheses)
      .values(data)
      .onConflictDoUpdate({ target: invTheses.proposalItemId, set: rest });
  },

  // ---- alertas ----

  /** Não vistos primeiro, depois os mais recentes. */
  async alerts(userId: ULID, f: { unseenOnly?: boolean; limit: number }) {
    return db
      .select({ alert: invAlerts, ticker: invAssets.ticker })
      .from(invAlerts)
      .leftJoin(invAssets, eq(invAssets.id, invAlerts.assetId))
      .where(and(eq(invAlerts.userId, userId), f.unseenOnly ? eq(invAlerts.seen, false) : undefined))
      .orderBy(invAlerts.seen, desc(invAlerts.createdAt))
      .limit(f.limit);
  },

  async markAlertSeen(userId: ULID, id: ULID) {
    await db
      .update(invAlerts)
      .set({ seen: true })
      .where(and(eq(invAlerts.id, id), eq(invAlerts.userId, userId)));
  },

  /** Chaves de alertas de fato relevante que o usuário já recebeu (em qualquer dia). */
  async filingAlertKeys(userId: ULID) {
    const rows = await db
      .select({ key: invAlerts.key })
      .from(invAlerts)
      .where(and(eq(invAlerts.userId, userId), like(invAlerts.key, "fato_relevante:%")));
    return new Set(rows.map((r) => r.key));
  },

  /** Devolve true se o alerta é novo (o mesmo gatilho não repete no mesmo dia). */
  async createAlert(data: Omit<InferInsertModel<typeof invAlerts>, "id">) {
    const created = await db
      .insert(invAlerts)
      .values(data)
      .onConflictDoNothing()
      .returning({ id: invAlerts.id });
    return created.length > 0;
  },

  // ---- sugestões do Claude ----

  async pendingChanges(userId: ULID) {
    return db
      .select()
      .from(invPendingChanges)
      .where(and(eq(invPendingChanges.userId, userId), eq(invPendingChanges.status, "pendente")))
      .orderBy(desc(invPendingChanges.createdAt))
      .limit(50);
  },

  async findChange(userId: ULID, id: ULID) {
    const [row] = await db
      .select()
      .from(invPendingChanges)
      .where(and(eq(invPendingChanges.id, id), eq(invPendingChanges.userId, userId)));
    return row;
  },

  async createChange(data: Omit<InferInsertModel<typeof invPendingChanges>, "id">) {
    const [row] = await db.insert(invPendingChanges).values(data).returning();
    return row!;
  },

  async decideChange(id: ULID, status: "aplicada" | "recusada") {
    const [row] = await db
      .update(invPendingChanges)
      .set({ status, decidedAt: new Date() })
      .where(eq(invPendingChanges.id, id))
      .returning();
    return row!;
  },
});

export type PortfolioQueries = ReturnType<typeof queries>;

export const createPortfolioRepository = (db: DB) => ({
  ...queries(db),

  /** Roda `fn` numa transação: ou tudo é gravado, ou nada. */
  async transaction<T>(fn: (repo: PortfolioQueries) => Promise<T>): Promise<T> {
    return db.transaction((tx) => fn(queries(tx as unknown as DB)));
  },
});
