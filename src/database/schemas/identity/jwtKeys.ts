import {
  datetime,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { id, timestamps } from "../../columns.helpers";

export const jwtkeys = mysqlTable(
  "jwt_keys",
  {
    id,
    kid: varchar("kid", { length: 50 }).notNull(),
    publicKey: text("public_key").notNull(),
    privateKey: text("private_key").notNull(),
    expiresAt: datetime("expires_at").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_jwt_keys_kid").on(table.kid)],
);
