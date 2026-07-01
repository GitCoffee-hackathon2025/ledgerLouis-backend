import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";
import { projects } from "../projects/projects.js";

// Adicionar futuramente o campo de documento (imagem, pdf)

export const transactions = pgTable(
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
