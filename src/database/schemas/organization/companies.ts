import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { id, timestamps } from "../../columns.helpers.js";

export const companies = mysqlTable("companies", {
  id,
  name: varchar("name", { length: 150 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }).notNull().unique(),
  ...timestamps,
});

/* 
CREATE TABLE companies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  cnpj VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
*/
