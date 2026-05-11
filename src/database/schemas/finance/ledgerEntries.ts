import { decimal, mysqlEnum, mysqlTable } from "drizzle-orm/mysql-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";
import { transactions } from "./transactions.js";
import { accounts } from "./accounts.js";
import { entryTypesEnum } from "../../../shared/enums/index.js";

export const ledgerEntries = mysqlTable("ledger_entries", {
  id,
  companyId: foreignId("company_id", () => companies.id).notNull(),
  transactionId: foreignId("transaction_id", () => transactions.id).notNull(),
  accountId: foreignId("account_id", () => accounts.id).notNull(),
  entryType: mysqlEnum("entry_type", entryTypesEnum).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(), // amount > 0
  ...timestamps,
});
// amount deve ser modificado para estar em centavos e deve ser maior que zero
