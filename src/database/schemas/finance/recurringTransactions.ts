import {
  date,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
} from "drizzle-orm/mysql-core";
import { foreignId, id } from "../../columns.helpers.js";
import { projects } from "../projects/projects.js";
import { accounts } from "./accounts.js";
import { companies } from "../organization/companies.js";
import { frequencyEnum } from "../../../shared/enums/index.js";

export const recurringTransactions = mysqlTable("recurring_transactions", {
  id,
  companyId: foreignId("company_id", () => companies.id).notNull(),
  projectId: foreignId("project_id", () => projects.id).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  sourceAccountId: foreignId("source_account_id", () => accounts.id).notNull(),
  categoryAccountId: foreignId(
    "category_account_id",
    () => companies.id,
  ).notNull(),
  frequency: mysqlEnum("frequnecy", frequencyEnum).notNull(),
  intervalValue: int("interval_value").$defaultFn(() => 1),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextRunDate: date("next_run_date").notNull(),
});
/* 
CREATE TABLE recurring_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,

  description TEXT,
  amount DECIMAL(15,2) NOT NULL,

  source_account_id BIGINT UNSIGNED NOT NULL,
  category_account_id BIGINT UNSIGNED NOT NULL,

  frequency ENUM('weekly','monthly','yearly') NOT NULL,
  interval_value INT DEFAULT 1,

  start_date DATE NOT NULL,
  end_date DATE,
  next_run_date DATE NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,

  FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE SET NULL,

  FOREIGN KEY (source_account_id, company_id)
    REFERENCES accounts(id, company_id)
    ON DELETE RESTRICT,

  FOREIGN KEY (category_account_id, company_id)
    REFERENCES accounts(id, company_id)
    ON DELETE RESTRICT
);
*/
