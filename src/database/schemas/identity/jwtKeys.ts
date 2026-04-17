import {
  char,
  datetime,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { id } from "../../columns.helpers";

import { generateId, type ULID } from "../../../lib/id";

export const jwtKeys = mysqlTable(
  "jwt_keys",
  {
    id,
    kid: char("kid", { length: 26 })
      .$type<ULID>()
      .notNull()
      .$defaultFn(() => generateId()),
    publicKey: text("public_key").notNull(),
    privateKey: text("private_key").notNull(),
    expiresAt: datetime("expires_at").notNull(),
    revokedAt: timestamp("revoke_at"),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [uniqueIndex("uq_jwt_keys_kid").on(table.kid)],
);
