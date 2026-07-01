import { pgTable, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../../columns.helpers.js";

export const companies = pgTable("companies", {
  id,
  name: varchar("name", { length: 150 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }).notNull().unique(),
  ...timestamps,
});
