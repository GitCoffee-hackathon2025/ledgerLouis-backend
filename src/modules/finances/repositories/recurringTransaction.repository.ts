import { type DB } from "../../../types/db.js";
import { and, eq, isNull, type InferInsertModel } from "drizzle-orm";
import { recurringTransactions } from "../../../database/schemas/index.js";

type RecurringTransactionInsert = InferInsertModel<typeof recurringTransactions>;

export const createRecurringTransactionRepository = (db: DB) => ({
  async create(data: RecurringTransactionInsert) {
    return db.insert(recurringTransactions).values(data);
  },

  async update(
    id: NonNullable<RecurringTransactionInsert["id"]>,
    data: Partial<RecurringTransactionInsert>,
  ) {
    return db
      .update(recurringTransactions)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(recurringTransactions.id, id),
          isNull(recurringTransactions.deletedAt),
        ),
      );
  },

  async findById(id: NonNullable<RecurringTransactionInsert["id"]>) {
    return db.query.recurringTransactions.findFirst({
      where: (table, { eq, isNull, and }) =>
        and(eq(table.id, id), isNull(table.deletedAt)),
    });
  },

  async listByCompany(companyId: NonNullable<RecurringTransactionInsert["companyId"]>) {
    return db.query.recurringTransactions.findMany({
      where: (table, { eq, isNull, and }) =>
        and(eq(table.companyId, companyId), isNull(table.deletedAt)),
      orderBy: (table, { asc }) => asc(table.nextRunDate),
    });
  },

  // Cross-company: usado pelo worker para achar tudo que venceu, independente da empresa.
  async listDue(today: string) {
    return db.query.recurringTransactions.findMany({
      where: (table, { eq, and, lte, isNull }) =>
        and(
          eq(table.status, "active"),
          lte(table.nextRunDate, today),
          isNull(table.deletedAt),
        ),
      orderBy: (table, { asc }) => asc(table.nextRunDate),
    });
  },

  async delete(id: NonNullable<RecurringTransactionInsert["id"]>) {
    return db
      .update(recurringTransactions)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(recurringTransactions.id, id),
          isNull(recurringTransactions.deletedAt),
        ),
      );
  },
});
