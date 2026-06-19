import { decimal, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";
import { transactions } from "./transactions.js";
import { accounts } from "./accounts.js";
import { entryTypesEnum } from "../../../shared/enums/index.js";
export const entryTypes = pgEnum("entry_type", entryTypesEnum);
export const ledgerEntries = pgTable("ledger_entries", {
  id,
  companyId: foreignId("company_id", () => companies.id).notNull(),
  transactionId: foreignId("transaction_id", () => transactions.id).notNull(),
  accountId: foreignId("account_id", () => accounts.id).notNull(),
  entryType: entryTypes().notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(), // amount > 0
  ...timestamps,
});
// amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0)

/* 
CREATE TABLE ledger_entries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  transaction_id BIGINT UNSIGNED NOT NULL,
  account_id BIGINT UNSIGNED NOT NULL,

  entry_type ENUM('debit','credit') NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,

  FOREIGN KEY (transaction_id, company_id)
    REFERENCES transactions(id, company_id)
    ON DELETE RESTRICT,

  FOREIGN KEY (account_id, company_id)
    REFERENCES accounts(id, company_id)
    ON DELETE RESTRICT
);
*/
