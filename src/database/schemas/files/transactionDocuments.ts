import { pgTable } from "drizzle-orm/pg-core";
import { foreignId } from "../../columns.helpers.js";
import { transactions } from "../finance/transactions.js";
import { files } from "./files.js";

export const transactionDocuments = pgTable("transaction_documents", {
  fileId: foreignId("file_id", () => files.id).primaryKey(),
  transactionId: foreignId("transaction_id", () => transactions.id).notNull(),
});
