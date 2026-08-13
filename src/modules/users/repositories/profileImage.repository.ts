import { type DB } from "../../../types/db.js";
import { and, eq, type InferInsertModel } from "drizzle-orm";
import { userProfileImages as profileImages } from "../../../database/schemas/index.js";

type ProfileImageInsert = InferInsertModel<typeof profileImages>;

export const createProfileImageRepository = (db: DB) => ({
  async create(data: ProfileImageInsert) {
    return db.insert(profileImages).values(data).returning();
  },

  async findByUserId(userId: NonNullable<ProfileImageInsert["userId"]>) {
    return db.query.userProfileImages.findFirst({
      where: (table, { eq }) => and(eq(table.userId, userId)),
    });
  },

  async findAll() {
    return db.query.users.findMany();
  },

  async deleteByUserId(userId: NonNullable<ProfileImageInsert["userId"]>) {
    return db
      .delete(profileImages)
      .where(eq(profileImages.userId, userId))
      .returning();
  },
});
