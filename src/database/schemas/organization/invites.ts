import {
  datetime,
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "./companies.js";
import { guestsEnum } from "../../../shared/enums/index.js";

export const invites = mysqlTable(
  "invites",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    role: mysqlEnum("role", guestsEnum).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires_at: datetime().notNull(),
    accepted_at: datetime(),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_token_invites").on(table.token)],
);
