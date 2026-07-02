import { pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../../columns.helpers.js";

export const users = pgTable(
  "users",
  {
    id,
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    isVerified: timestamp("is_verified"),
    avatar: varchar("avatar", { length: 255 }),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_users_email").on(table.email)],
);
