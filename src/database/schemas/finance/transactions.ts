import { date, integer, numeric, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";
import { projects } from "../projects/projects.js";
import { entryTypesEnum } from "../../../shared/enums/index.js";

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
      entryType: entryTypes().notNull(),
      amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_transactions_id_company").on(table.id, table.companyId),
  ],
);
