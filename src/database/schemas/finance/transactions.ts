import { integer, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
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
    //temporario
      entryType: entryTypes().notNull(),
      amount: integer("amount").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_transactions_id_company").on(table.id, table.companyId),
  ],
);
