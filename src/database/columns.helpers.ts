import { char, timestamp } from "drizzle-orm/mysql-core";

import { type ULID, generateId } from "../lib/id";

export const ulid = (name: string) =>
  char(name, { length: 26 })
    .$type<ULID>()
    .$defaultFn(() => generateId());

export const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp(),
  deletedAt: timestamp(),
};
