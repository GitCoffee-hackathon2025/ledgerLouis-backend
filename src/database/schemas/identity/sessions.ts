import {
  datetime,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { id, foreignId, timestamps } from "../../columns.helpers.js";
import { users } from "./users.js";

export const sessions = mysqlTable("sessions", {
  id,
  userId: foreignId("user_id", () => users.id).notNull(),
  revokedAt: timestamp("revoked_at"),
  lastActivityAt: timestamp("last_activity_at")
    .notNull()
    .$defaultFn(() => new Date()),
  expiresAt: datetime("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  ...timestamps,
});
