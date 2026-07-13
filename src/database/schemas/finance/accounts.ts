import { numeric, pgEnum, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";
import { accountTypesEnum } from "../../../shared/enums/index.js";

export const accountTypes = pgEnum("account_type", accountTypesEnum);

export const accounts = pgTable(
  "accounts",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    value:  numeric("value", {
  precision: 15,
  scale: 2,
}),
    type: accountTypes().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_accounts_id_company").on(table.id, table.companyId),
    uniqueIndex("uq_accounts_company_name").on(table.companyId, table.name),
    uniqueIndex("uq_accounts_company_value").on(table.companyId, table.value),
  ],
);
