import {
  datetime,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { id, foreignId, timestamps } from "../../columns.helpers";
import { users } from "./users";

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

/* 
CREATE TABLE sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,
  expires_at DATETIME NOT NULL,

  ip_address VARCHAR(45),
  user_agent TEXT,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
*/
