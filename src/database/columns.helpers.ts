import { char, timestamp } from "drizzle-orm/mysql-core";

import { type ULID, generateId } from "../lib/id";

export const id = char("id", { length: 26 })
  .$type<ULID>()
  .primaryKey()
  .$defaultFn(() => generateId());

export const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp(),
  deletedAt: timestamp(),
};
