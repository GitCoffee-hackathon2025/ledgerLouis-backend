import { pgTable, varchar } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { transactions } from "./transactions.js";
import { companies } from "../organization/companies.js";

// Essa tabela está desativada

export const transactionDocuments = pgTable("transaction_documents", {
  id,
  transationId: foreignId("transaction_id", () => transactions.id).notNull(),
  companyId: foreignId("company_id", () => companies.id).notNull(),
  fileUrl: varchar("file_url", { length: 250 }).notNull(),
  fileName: varchar("file_name", { length: 500 }),
  fileType: varchar("file_type", { length: 50 }),
  ...timestamps,
});
