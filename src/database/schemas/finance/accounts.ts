import {
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { foreignId, id, timestamps } from "../../columns.helpers";
import { companies } from "../organization/companies";
import { accountTypesEnum } from "../../../shared/enums";

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
