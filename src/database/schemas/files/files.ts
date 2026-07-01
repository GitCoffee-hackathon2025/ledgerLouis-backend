import { pgTable, varchar, integer } from "drizzle-orm/pg-core";
import { id, timestamps } from "../../columns.helpers.js";

export const files = pgTable("files", {
  id,
  originalName: varchar("original_name", { length: 255 }).notNull(),
  storageName: varchar("storage_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  size: integer("size").notNull(),
  ...timestamps,
});
