import { type DB } from "../../../types/db.js";
import { and, eq, isNull } from "drizzle-orm";
import { transactions, transactionTags } from "../../../database/schemas/index.js";
import type { ULID } from "../../../domain/shared/id.js";

export const createAnalyticsRepository = (db: DB) => ({
  async listExpensesByCompany(companyId: ULID) {
    return db.query.transactions.findMany({
      where: (table, { eq, and, isNull }) =>
        and(
          eq(table.companyId, companyId),
          eq(table.entryType, "debit"),
          isNull(table.deletedAt),
        ),
      columns: { amount: true, date: true },
    });
  },

  async listExpensesByCompanyAndTag(companyId: ULID, tagId: ULID) {
    return db
      .select({ amount: transactions.amount, date: transactions.date })
      .from(transactions)
      .innerJoin(
        transactionTags,
        eq(transactionTags.transactionId, transactions.id),
      )
      .where(
        and(
          eq(transactions.companyId, companyId),
          eq(transactions.entryType, "debit"),
          eq(transactionTags.tagId, tagId),
          isNull(transactions.deletedAt),
          isNull(transactionTags.deletedAt),
        ),
      );
  },
});
