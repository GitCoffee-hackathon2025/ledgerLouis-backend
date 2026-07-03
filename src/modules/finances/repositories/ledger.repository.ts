import { type DB } from "../../../types/db.js";
import { and,  eq, isNull } from "drizzle-orm";
import { ledgerEntries } from "../../../database/schemas/index.js";
import type { ULID } from "../../../domain/shared/id.js";
export const createLedgerRepository = (db: DB) => ({
  async create(data: any) {
    return db.insert(ledgerEntries).values(data);
  },

  async update(id: string, data: any) {
    return db.update(ledgerEntries).set({ ...data, updatedAt: new Date() }).where(and(eq(ledgerEntries.id, id as ULID), isNull(ledgerEntries.deletedAt)));
  },

  async findById(id: string) {
    return db.query.ledgerEntries.findFirst({ where: (table, { eq, isNull, and }) => and(eq(table.id, id as ULID), isNull(table.deletedAt)) });
  },

  async listByTransaction(transactionId: string) {
    return db.query.ledgerEntries.findMany({ where: (table, { eq, isNull }) => and(eq(table.transactionId, transactionId as ULID), isNull(table.deletedAt)) });
  },

  async delete(id: string) {
    return db.update(ledgerEntries).set({ deletedAt: new Date() }).where(and(eq(ledgerEntries.id, id as ULID), isNull(ledgerEntries.deletedAt)));
  },
});
