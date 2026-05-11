import { mysqlEnum, mysqlTable, uniqueIndex } from "drizzle-orm/mysql-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { companies } from "./companies.js";
import { users } from "../identity/users.js";
import { permissionsEnum } from "../../../shared/enums/index.js";

export const companyUsers = mysqlTable(
  "company_users",
  {
    id,
    companyId: foreignId("company_id", () => companies.id).notNull(),
    userId: foreignId("user_id", () => users.id).notNull(),
    role: mysqlEnum("role", permissionsEnum).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_company_users_membership").on(
      table.companyId,
      table.userId,
    ),
  ],
);
