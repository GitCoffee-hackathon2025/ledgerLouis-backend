import {
  timestamp,
  pgEnum,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "./companies.js";
import { guestsEnum } from "../../../domain/organization/enums.js";

export const role = pgEnum("guest_role", guestsEnum);

export const invites = pgTable(
  "invites",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    role: role().notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires_at: timestamp("expires_at", { mode: "date" }).notNull(),
    accepted_at: timestamp("accepted_at", { mode: "date" }),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_token_invites").on(table.token)],
);
