import { date, decimal, mysqlEnum, mysqlTable } from "drizzle-orm/mysql-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { transactions } from "./transactions.js";
import { installmentStatusEnum } from "../../../shared/enums/index.js";

export const installments = mysqlTable("installments", {
  id,
  transactionId: foreignId("transaction_id", () => transactions.id).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  status: mysqlEnum("status", installmentStatusEnum).$defaultFn(
    () => "planned",
  ),
  paidAt: date("paid_at"),
  ...timestamps,
});
