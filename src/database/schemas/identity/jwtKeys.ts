import {
  char,
  timestamp,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { id } from "../../columns.helpers.js";

import { generateId, type ULID } from "../../../lib/id.js";

export const jwtKeys = pgTable(
  "jwt_keys",
  {
    id,
    kid: char("kid", { length: 26 })
      .$type<ULID>()
      .notNull()
      .$defaultFn(() => generateId()),
    publicKey: text("public_key").notNull(),
    privateKey: text("private_key").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("uq_jwt_keys_kid").on(table.kid)],
);
