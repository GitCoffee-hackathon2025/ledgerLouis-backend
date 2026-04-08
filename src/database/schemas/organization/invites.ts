import {
  datetime,
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { foreignId, id, timestamps } from "../../columns.helpers";
import { companies } from "./companies";
import { guestsEnum } from "../../../shared/enums";

export const invites = mysqlTable(
  "invites",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    role: mysqlEnum("role", guestsEnum).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires_at: datetime().notNull(),
    accepted_at: datetime(),
    ...timestamps,
  },
  (table) => [uniqueIndex("uq_token_invites").on(table.token)],
);

/* 
CREATE TABLE invites (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,

  email VARCHAR(150) NOT NULL,
  role ENUM('admin','viewer') NOT NULL,

  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  accepted_at DATETIME,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  UNIQUE (token),
  UNIQUE (company_id, email),

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE
);
*/
