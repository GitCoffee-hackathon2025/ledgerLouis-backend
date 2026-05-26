import { mysqlTable, text, uniqueIndex } from "drizzle-orm/mysql-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";
import { projects } from "../projects/projects.js";

// Adicionar futuramente o campo de documento (imagem, pdf)

export const transactions = mysqlTable(
  "transactions",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    projectId: foreignId("project_id", () => projects.id),
    description: text("description"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_transactions_id_company").on(table.id, table.companyId),
  ],
);
/* 
CREATE TABLE transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,

  description TEXT,

  created_by BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  UNIQUE (id, company_id),

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,

  FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE SET NULL,

  FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);
*/
