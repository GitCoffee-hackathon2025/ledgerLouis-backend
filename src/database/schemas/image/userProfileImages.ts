import {
  mysqlTable,
  varchar,
} from "drizzle-orm/mysql-core";

import {
  id,
  timestamps,
} from "../../columns.helpers.js";

export const userProfileImages =
  mysqlTable("user_profile_images", {
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