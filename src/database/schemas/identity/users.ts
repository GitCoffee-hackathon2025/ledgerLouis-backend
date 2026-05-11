import {
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { id, timestamps } from "../../columns.helpers.js";

export const users = mysqlTable(
  "users",
  {
    id,
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 150 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    isVerified: timestamp("is_verified"),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_users_email").on(table.email)],
);
