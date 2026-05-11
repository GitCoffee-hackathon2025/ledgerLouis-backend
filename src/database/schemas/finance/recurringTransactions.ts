import {
  date,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
} from "drizzle-orm/mysql-core";
import { foreignId, id } from "../../columns.helpers.js";
import { projects } from "../projects/projects.js";
import { accounts } from "./accounts.js";
import { companies } from "../organization/companies.js";
import { frequencyEnum } from "../../../shared/enums/index.js";

export const recurringTransactions = mysqlTable("recurring_transactions", {
  id,
  companyId: foreignId("company_id", () => companies.id).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  sourceAccountId: foreignId("source_account_id", () => accounts.id).notNull(),
  categoryAccountId: foreignId(
    "category_account_id",
    () => accounts.id,
  ).notNull(),
  frequency: mysqlEnum("frequency", frequencyEnum).notNull(),
  intervalValue: int("interval_value").$defaultFn(() => 1),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextRunDate: date("next_run_date").notNull(),
});
