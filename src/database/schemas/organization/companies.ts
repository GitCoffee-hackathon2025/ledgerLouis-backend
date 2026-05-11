import { char, mysqlTable, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { id, timestamps } from "../../columns.helpers.js";

export const companies = mysqlTable(
  "companies",
  {
    id,
    name: varchar("name", { length: 150 }).notNull(),
    cnpj: char("cnpj", { length: 14 }).notNull().unique(),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_companies_cnpj").on(table.cnpj)],
);
