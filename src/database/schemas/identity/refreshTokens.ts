import { timestamp, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, foreignId, timestamps } from "../../columns.helpers.js";
import { users } from "./users.js";
import { sessions } from "./sessions.js";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id,
    userId: foreignId("user_id", () => users.id).notNull(),
    sessionId: foreignId("session_id", () => sessions.id).notNull(),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at"),
    replacedBy: foreignId("replaced_by", (): any => refreshTokens.id),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_refresh_token_hash").on(table.tokenHash)],
);
