import { type DB } from "../../../types/db.js";
import { and, eq, isNull } from "drizzle-orm";
import { transactions } from "../../../database/schemas/index.js";
import type { ULID } from "../../../domain/shared/id.js";
export const createTransactionRepository = (db: DB) => ({
  async create(data: any) {
    return db.insert(transactions).values(data);
  },

  async update(id: string, data: any) {
    return db.update(transactions).set({ ...data, updatedAt: new Date() }).where(and(eq(transactions.id, id as ULID), isNull(transactions.deletedAt)));
  },

  async findById(id: string) {
    return db.query.transactions.findFirst({ where: (table, { eq, isNull, and }) => and(eq(table.id, id as ULID), isNull(table.deletedAt)) });
  },

  async list() {
    return db.query.transactions.findMany({ where: (table, { isNull }) => isNull(table.deletedAt) });
  },

  async delete(id: string) {
    return db.update(transactions).set({ deletedAt: new Date() }).where(and(eq(transactions.id, id as ULID), isNull(transactions.deletedAt)));
  },
});
