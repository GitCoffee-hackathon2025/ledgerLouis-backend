import { eq, and, type InferInsertModel } from "drizzle-orm";
import type { DB } from "../../../types/db.js";
import type {
  TransactionLedger,
  TransactionLedgerUpdate,
  TransactionLedgerListOpts,
} from "../schemas/ledger.schema.js";

import type { ULID } from "../../../domain/shared/id.js";
import { ledgerEntries } from "../../../database/schemas/index.js";

type LedgerInsert = InferInsertModel<typeof ledgerEntries>;

export const createLedgerRepository = (db: DB) => ({
  async create(data: LedgerInsert) {
    const [inserted] = await db
      .insert(ledgerEntries)
      .values(data)
      .returning();
    return inserted as TransactionLedger;
  },

  async findById(id: ULID) {
    const [row] = await db
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.id, id))
      .limit(1);
    return row as TransactionLedger | undefined;
  },

  async list() {
    const rows = await db
      .select()
      .from(ledgerEntries)
      .orderBy(ledgerEntries.createdAt);
    return rows as TransactionLedger[];
  },

  async listByTransaction(transactionId: ULID) {
    const rows = await db
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.transactionId, transactionId) )
      .orderBy(ledgerEntries.createdAt);
    return rows as TransactionLedger[];
  },

  async listFiltered(opts: TransactionLedgerListOpts = {}) {
    const conditions = [];

    if (opts.transactionId) {
      conditions.push(eq(ledgerEntries.transactionId, opts.transactionId as ULID));
    }
    if (opts.companyId) {
      conditions.push(eq(ledgerEntries.companyId, opts.companyId as ULID));
    }
    if (opts.accountId) {
      conditions.push(eq(ledgerEntries.accountId, opts.accountId as ULID));
    }
    if (opts.entryType) {
      conditions.push(eq(ledgerEntries.entryType, opts.entryType as "debit" | "credit"));
    }

    const baseQuery = db.select().from(ledgerEntries);
    const queryWithConditions = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;
    
    const rows = await queryWithConditions.orderBy(ledgerEntries.createdAt);
    return rows as TransactionLedger[];
  },

  async update(id: ULID, data: TransactionLedgerUpdate) {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );
    const [updated] = await db
      .update(ledgerEntries)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(ledgerEntries.id, id))
      .returning();
    return updated as TransactionLedger;
  },

  async delete(id: ULID) {
    await db
      .delete(ledgerEntries)
      .where(eq(ledgerEntries.id, id));
  },
});