import { pgEnum, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "./companies.js";
import { users } from "../identity/users.js";
import { permissionsEnum } from "../../../shared/enums/index.js";
export const roles = pgEnum("role", permissionsEnum);
export const companyUsers = pgTable(
  "company_users",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    userId: foreignId("user_id", () => users.id).notNull(),
    role: roles().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_company_users_membership").on(
      table.companyId,
      table.userId,
    ),
  ],
);

/* 
CREATE TABLE company_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('owner','admin','viewer') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  UNIQUE (company_id, user_id),

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
*/
