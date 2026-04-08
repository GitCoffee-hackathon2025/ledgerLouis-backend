import { date, decimal, mysqlEnum, mysqlTable } from "drizzle-orm/mysql-core";
import { foreignId, id, timestamps } from "../../columns.helpers";
import { transactions } from "./transactions";
import { installmentStatusEnum } from "../../../shared/enums";

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
/* 
CREATE TABLE installments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_id BIGINT UNSIGNED NOT NULL,

  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,

  status ENUM('planned','paid','cancelled') DEFAULT 'planned',
  paid_at DATE NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (transaction_id)
    REFERENCES transactions(id)
    ON DELETE CASCADE
);
*/
