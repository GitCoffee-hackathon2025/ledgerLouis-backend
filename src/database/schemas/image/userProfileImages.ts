import {
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";

import {
  id,
  timestamps,
} from "../../columns.helpers.js";

export const userProfileImages =
  pgTable("user_profile_images", {
    id,

    userId: varchar("user_id", {
      length: 26,
    })
      .notNull()
      .unique(),

    fileId: varchar("file_id", {
      length: 26,
    })
      .notNull()
      .unique(),

    ...timestamps,
  });