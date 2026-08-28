import { type DB } from "../../../types/db.js";
import { and, eq, isNull, type InferInsertModel } from "drizzle-orm";
import { tags, transactionTags } from "../../../database/schemas/index.js";
import type { ULID } from "../../../domain/shared/id.js";

type TransactionTagInsert = InferInsertModel<typeof transactionTags>;

export const createTransactionTagRepository = (db: DB) => ({
  async create(data: TransactionTagInsert) {
    return db.insert(transactionTags).values(data);
  },

  async findLink(transactionId: ULID, tagId: ULID) {
    return db.query.transactionTags.findFirst({
      where: (table, { eq, isNull, and }) =>
        and(
          eq(table.transactionId, transactionId),
          eq(table.tagId, tagId),
          isNull(table.deletedAt),
        ),
    });
  },

  async listByTransaction(transactionId: ULID) {
    return db
      .select({
        id: tags.id,
        companyId: tags.companyId,
        name: tags.name,
      })
      .from(transactionTags)
      .innerJoin(tags, eq(tags.id, transactionTags.tagId))
      .where(
        and(
          eq(transactionTags.transactionId, transactionId),
          isNull(transactionTags.deletedAt),
          isNull(tags.deletedAt),
        ),
      );
  },

  async delete(id: NonNullable<TransactionTagInsert["id"]>) {
    return db
      .update(transactionTags)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(transactionTags.id, id), isNull(transactionTags.deletedAt)),
      );
  },
});
