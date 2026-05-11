import {
  date,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";

export const projects = mysqlTable(
  "projects",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_projects_company_name").on(table.companyId, table.name),
  ],
);
