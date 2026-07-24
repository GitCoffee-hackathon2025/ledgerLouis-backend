import { pgTable } from "drizzle-orm/pg-core";
import { foreignId } from "../../columns.helpers.js";
import { users } from "../identity/users.js";
import { files } from "./files.js";

export const userProfileImages = pgTable("user_profile_images", {
  fileId: foreignId("file_id", () => files.id).primaryKey(),
  userId: foreignId("user_id", () => users.id)
    .notNull()
    .unique(),
});
