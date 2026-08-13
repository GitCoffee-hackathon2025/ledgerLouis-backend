import { date, integer, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { transactions } from "./transactions.js";
import { installmentStatusEnum } from "../../../domain/finance/enums.js";

export const installmentStatus = pgEnum(
  "installment_status",
  installmentStatusEnum,
);

export const installments = pgTable("installments", {
  id,
  transactionId: foreignId("transaction_id", () => transactions.id).notNull(),
  amount: integer("amount").notNull(),
  dueDate: date("due_date").notNull(),
  status: installmentStatus().$defaultFn(() => "planned"),
  paidAt: date("paid_at"),
  ...timestamps,
});
