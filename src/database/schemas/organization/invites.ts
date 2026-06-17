import {
  timestamp,
  pgEnum,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "./companies.js";
import { guestsEnum } from "../../../shared/enums/index.js";
export const role = pgEnum("guest_role", guestsEnum);
export const invites = pgTable(
  "invites",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    role: role().notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires_at: timestamp("expires_at", { mode: "date" }).notNull(),
    accepted_at: timestamp("accepted_at", { mode: "date" }),
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
