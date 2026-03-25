import { mysqlTable, int } from "drizzle-orm/mysql-core";
import { timestamps } from "../columns.helpers";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  ...timestamps,
});
