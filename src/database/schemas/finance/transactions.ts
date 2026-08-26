import { date, integer, numeric, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";
import { projects } from "../projects/projects.js";
import { recurringTransactions } from "./recurringTransactions.js";
import { entryTypesEnum } from "../../../domain/finance/enums.js";

// Adicionar futuramente o campo de documento (imagem, pdf)

const entryTypes = pgEnum("entry_type", entryTypesEnum);
export const transactions = pgTable(
  "transactions",
  {
    id,
    companyId: foreignId("company_id", () => companies.id),
    projectId: foreignId("project_id", () => projects.id),
    description: text("description"),
    date: date("date", { mode: "string" }).notNull(),
    //temporario
      entryType: entryTypes("entry_type").notNull(),
      amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
      recurringTransactionId: foreignId(
        "recurring_transaction_id",
        () => recurringTransactions.id,
      ),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_transactions_id_company").on(table.id, table.companyId),
    uniqueIndex("uq_transactions_recurring_date")
      .on(table.recurringTransactionId, table.date)
      .where(sql`${table.recurringTransactionId} IS NOT NULL`),
  ],
);
