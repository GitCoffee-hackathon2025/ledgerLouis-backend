import { type AnyPgColumn, char, timestamp } from "drizzle-orm/pg-core";

import { type ULID, generateId } from "../domain/shared/id.js";

export const id = char("id", { length: 26 })
  .$type<ULID>()
  .primaryKey()
  .$defaultFn(() => generateId());

export const foreignId = (name: string, ref: () => AnyPgColumn) =>
  char(name, { length: 26 })
    .$type<ULID>()
    .references(ref, { onDelete: "restrict" });

export const timestamps = {
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
};
