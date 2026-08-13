import type { DB } from "../../types/db.js";
import { and, eq, isNull, type InferInsertModel } from "drizzle-orm";
import { files } from "../../database/schemas/files/files.js";

type FileInsert = InferInsertModel<typeof files>;

export const createFileRepository = (db: DB) => ({
  async create(data: FileInsert) {
    return db.insert(files).values(data).returning();
  },

  async findById(id: NonNullable<FileInsert["id"]>) {
    return db.query.files.findFirst({
      where: (table, { and, eq, isNull }) =>
        and(eq(table.id, id), isNull(table.deletedAt)),
    });
  },

  async findDeletedById(id: NonNullable<FileInsert["id"]>) {
    return db.query.files.findFirst({
      where: (table, { and, eq, isNotNull }) =>
        and(eq(table.id, id), isNotNull(table.deletedAt)),
    });
  },

  async delete(id: NonNullable<FileInsert["id"]>) {
    return db
      .update(files)
      .set({ deletedAt: new Date() })
      .where(and(eq(files.id, id), isNull(files.deletedAt)))
      .returning();
  },
});
