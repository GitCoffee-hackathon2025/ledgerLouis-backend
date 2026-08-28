import { type DB } from "../../../types/db.js";
import { and, eq, isNull, type InferInsertModel } from "drizzle-orm";
import { tags } from "../../../database/schemas/index.js";
import type { ULID } from "../../../domain/shared/id.js";

type TagInsert = InferInsertModel<typeof tags>;

export const createTagRepository = (db: DB) => ({
  async create(data: TagInsert) {
    return db.insert(tags).values(data);
  },

  async update(
    id: NonNullable<TagInsert["id"]>,
    data: Partial<Pick<TagInsert, "name">>,
  ) {
    return db
      .update(tags)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tags.id, id), isNull(tags.deletedAt)))
      .returning({
        id: tags.id,
        companyId: tags.companyId,
        name: tags.name,
      })
      .then(([row]) => row);
  },

  async findById(id: NonNullable<TagInsert["id"]>) {
    return db.query.tags.findFirst({
      where: (table, { eq, isNull, and }) =>
        and(eq(table.id, id), isNull(table.deletedAt)),
    });
  },

  async listByCompany(companyId: NonNullable<TagInsert["companyId"]>) {
    return db.query.tags.findMany({
      where: (table, { eq, isNull, and }) =>
        and(eq(table.companyId, companyId), isNull(table.deletedAt)),
    });
  },

  async delete(id: NonNullable<TagInsert["id"]>) {
    return db
      .update(tags)
      .set({ deletedAt: new Date() })
      .where(and(eq(tags.id, id), isNull(tags.deletedAt)));
  },
});
