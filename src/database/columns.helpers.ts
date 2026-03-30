import { AnyMySqlColumn, char, timestamp } from "drizzle-orm/mysql-core";

import { type ULID, generateId } from "../lib/id";

export const id = char("id", { length: 26 })
  .$type<ULID>()
  .primaryKey()
  .$defaultFn(() => generateId());

export const foreignId = (
  name: string,
  ref: () => AnyMySqlColumn
) =>
  char(name, { length: 26 })
    .$type<ULID>()
    .notNull()
    .references(ref, { onDelete: "restrict" });

export const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp(),
  deletedAt: timestamp(),
};
