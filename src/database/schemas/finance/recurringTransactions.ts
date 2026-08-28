import { date, numeric, pgEnum, pgTable, text, integer } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { accounts } from "./accounts.js";
import { companies } from "../organization/companies.js";
import { users } from "../identity/users.js";
import {
  entryTypesEnum,
  frequencyEnum,
  recurringStatusEnum,
} from "../../../domain/finance/enums.js";

export const frequency = pgEnum("frequency", frequencyEnum);
export const recurringStatus = pgEnum("recurring_status", recurringStatusEnum);
const entryTypes = pgEnum("entry_type", entryTypesEnum);

export const recurringTransactions = pgTable("recurring_transactions", {
  id,
  companyId: foreignId("company_id", () => companies.id).notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  entryType: entryTypes("entry_type").notNull(),
  sourceAccountId: foreignId("source_account_id", () => accounts.id),
  categoryAccountId: foreignId("category_account_id", () => accounts.id),
  frequency: frequency().notNull(),
  intervalValue: integer("interval_value").$defaultFn(() => 1),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextRunDate: date("next_run_date").notNull(),
  lastRunDate: date("last_run_date"),
  status: recurringStatus().$defaultFn(() => "active").notNull(),
  createdBy: foreignId("created_by", () => users.id),
  ...timestamps,
});
