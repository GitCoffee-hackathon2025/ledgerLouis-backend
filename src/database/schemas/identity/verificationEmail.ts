import { timestamp, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { foreignId, id } from "../../columns.helpers.js";
import { users } from "./users.js";

export const verificationEmail = pgTable(
  "verification_email",
  {
    id,
    userId: foreignId("user_id", () => users.id).notNull(),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  },
  (table) => [uniqueIndex("uq_token_verification_email").on(table.tokenHash)],
);
