import { date, pgTable, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "../organization/companies.js";

export const projects = pgTable("projects", {
  id,
  companyId: foreignId("company_id", () => companies.id).notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  ...timestamps,
}, (table) => [
  uniqueIndex("uq_projects_company_name").on(table.companyId, table.name),
]);

/* 
CREATE TABLE projects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  UNIQUE (company_id, name),

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE
);
*/
