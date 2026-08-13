import { date, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { foreignId, id } from "../../columns.helpers.js";
import { accounts } from "./accounts.js";
import { companies } from "../organization/companies.js";
import { frequencyEnum } from "../../../domain/finance/enums.js";

export const frequency = pgEnum("frequency", frequencyEnum);

export const recurringTransactions = pgTable("recurring_transactions", {
  id,
  companyId: foreignId("company_id", () => companies.id).notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  sourceAccountId: foreignId("source_account_id", () => accounts.id).notNull(),
  categoryAccountId: foreignId(
    "category_account_id",
    () => accounts.id,
  ).notNull(),
  frequency: frequency().notNull(),
  intervalValue: integer("interval_value").$defaultFn(() => 1),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextRunDate: date("next_run_date").notNull(),
});
