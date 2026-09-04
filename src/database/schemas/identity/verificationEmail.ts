import { timestamp, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { users } from "./users.js";

export const verificationEmail = pgTable(
  "verification_email",
  {
    id,
    userId: foreignId("user_id", () => users.id).notNull(),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_token_invites").on(table.tokenHash)],
);
