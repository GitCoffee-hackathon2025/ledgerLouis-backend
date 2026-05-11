import {
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";
import { accountTypesEnum } from "../../../shared/enums/index.js";

export const accounts = mysqlTable(
  "accounts",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    type: mysqlEnum("type", accountTypesEnum).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_accounts_id_company").on(table.id, table.companyId),
    uniqueIndex("uq_accounts_company_name").on(table.companyId, table.name),
  ],
);
