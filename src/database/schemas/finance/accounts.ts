import {
  pgEnum,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
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
    type: accountTypes().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_accounts_id_company").on(table.id, table.companyId),
    uniqueIndex("uq_accounts_company_name").on(table.companyId, table.name),
  ],
);
/* 
CREATE TABLE accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('asset','expense','revenue') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  UNIQUE (id, company_id),
  UNIQUE (company_id, name),

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE
);
*/
