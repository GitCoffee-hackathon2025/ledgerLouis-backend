import type { DB }
  from "../../types/db.js";

import type {
  InferInsertModel,
} from "drizzle-orm";

import { eq }
  from "drizzle-orm";

import { files }
  from "../../database/schemas/image/files.js";

type FileInsert =
  InferInsertModel<typeof files>;

export const createFileRepository = (
  db: DB
) => ({
  async create(data: FileInsert) {
    await db
      .insert(files)
      .values(data);

    return data;
  },

  async findById(
    id: NonNullable<FileInsert["id"]>
  ) {
    return db.query.files.findFirst({
      where: (table, { eq }) =>
        eq(table.id, id),
    });
  },

  async delete(
    id: NonNullable<FileInsert["id"]>
  ) {
    return db
      .delete(files)
      .where(eq(files.id, id))
      .returning({ id: files.id });
  },
});