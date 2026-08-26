import { integer, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";
import { transactions } from "./transactions.js";
import { accounts } from "./accounts.js";
import { entryTypesEnum } from "../../../domain/finance/enums.js";

export const entryTypes = pgEnum("entry_type", entryTypesEnum);

export const ledgerEntries = pgTable("ledger_entries", {
  id,
  companyId: foreignId("company_id", () => companies.id).notNull(),
  transactionId: foreignId("transaction_id", () => transactions.id).notNull(),
  accountId: foreignId("account_id", () => accounts.id),
  entryType: entryTypes("entry_type").notNull(),
  amount: integer("amount").notNull(),
  ...timestamps,
});
