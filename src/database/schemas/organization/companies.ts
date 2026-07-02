import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../../columns.helpers.js";

export const companies = pgTable(
  "companies",
  {
    id,
    name: varchar("name", { length: 150 }).notNull(),
    cnpj: varchar("cnpj", { length: 14 }).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_companies_cnpj").on(table.cnpj)],
);
