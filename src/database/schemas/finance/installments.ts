import { date, decimal, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { transactions } from "./transactions.js";
import { installmentStatusEnum } from "../../../shared/enums/index.js";
export const installmentStatus = pgEnum("installment_status", installmentStatusEnum);
export const installments = pgTable("installments", {
  id,
  transactionId: foreignId("transaction_id", () => transactions.id).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  status: installmentStatus().$defaultFn(
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
