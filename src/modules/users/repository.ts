import { type DB } from "../../types/db.js";
import type { InferInsertModel } from "drizzle-orm";
import { users } from "../../database/schemas/index.js";

type UserInsert = InferInsertModel<typeof users>;

export const createUserRepository = (db: DB) => ({
  async create(data: UserInsert) {
    return db.insert(users).values(data);
  },
  
  async findByEmail(email: UserInsert["email"]) {
    return db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, email),
    });
  },

  async findById(id: NonNullable<UserInsert["id"]>) {
    return db.query.users.findFirst({
      where: (table, { eq }) => eq(table.id, id),
    });
  },
});
