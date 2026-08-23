import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { foreignId, id, timestamps } from "../../columns.helpers.js";
import { transactions } from "./transactions.js";
import { tags } from "./tags.js";

export const transactionTags = pgTable(
  "transaction_tags",
  {
    id,
    transactionId: foreignId(
      "transaction_id",
      () => transactions.id,
    ).notNull(),
    tagId: foreignId("tag_id", () => tags.id).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("uq_transaction_tags_link").on(
      table.transactionId,
      table.tagId,
    ),
  ],
);
