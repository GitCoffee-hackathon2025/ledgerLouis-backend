import {
  char,
  datetime,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { id, foreignId, timestamps } from "../../columns.helpers";

// Outras tabelas
import { sessions } from "./sessions";

export const refreshTokens = mysqlTable(
  "refresh_tokens",
  {
    id,
    sessionId: foreignId("session_id", () => sessions.id).notNull(),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: datetime("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    replacedBy: foreignId("replaced_by", (): any => refreshTokens.id),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_refresh_tokens_token_hash").on(table.tokenHash)],
);

/* 
CREATE TABLE refresh_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,

  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,

  replaced_by_token_id BIGINT UNSIGNED NULL,

  UNIQUE (token_hash),

  FOREIGN KEY (session_id)
    REFERENCES sessions(id)
    ON DELETE CASCADE,

  FOREIGN KEY (replaced_by_token_id)
    REFERENCES refresh_tokens(id)
    ON DELETE SET NULL
);
*/
