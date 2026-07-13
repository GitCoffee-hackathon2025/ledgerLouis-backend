import { char, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../../columns.helpers.js";

export const companies = pgTable(
  "companies",
  {
    id,
    name: varchar("name", { length: 150 }).notNull(),
    cnpj: char("cnpj", { length: 14 }).notNull(),
    email: varchar("email", { length: 150 }),
    cep: char("cep", { length: 8 }),
    phone: varchar("phone", { length: 11 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_companies_cnpj").on(table.cnpj),
    uniqueIndex("uq_companies_email").on(table.email),
    uniqueIndex("uq_companies_phone").on(table.phone),
  ],
);
