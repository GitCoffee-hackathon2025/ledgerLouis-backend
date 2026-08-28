import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";

export const tags = pgTable(
  "tags",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_tags_company_name").on(table.companyId, table.name),
  ],
);
