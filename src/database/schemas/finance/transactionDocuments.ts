import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { transactions } from "./transactions.js";
import { companies } from "../organization/companies.js";

// Essa tabela está desativada

export const transactionDocuments = mysqlTable("transaction_documents", {
  id,
  transationId: foreignId("transaction_id", () => transactions.id).notNull(),
  companyId: foreignId("company_id", () => companies.id).notNull(),
  fileUrl: varchar("file_url", { length: 250 }).notNull(),
  fileName: varchar("file_name", { length: 500 }),
  fileType: varchar("file_type", { length: 50 }),
  ...timestamps,
});

/* 
CREATE TABLE transaction_documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_id BIGINT UNSIGNED NOT NULL,
  company_id BIGINT UNSIGNED NOT NULL,

  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(100),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (transaction_id, company_id)
    REFERENCES transactions(id, company_id)
    ON DELETE CASCADE
); para o futuro
*/
