import {
  timestamp,
  pgEnum,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "./companies.js";
import { users } from "../identity/users.js";
import { permissionsEnum } from "../../../domain/organization/enums.js";

export const role = pgEnum("permission_role", permissionsEnum);

export const invites = pgTable(
  "invites",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    invitedBy: foreignId("invited_by", () => users.id).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    role: role().notNull(),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at"),
    acceptedAt: timestamp("accepted_at", { mode: "date" }),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_token_invites").on(table.tokenHash)],
);
