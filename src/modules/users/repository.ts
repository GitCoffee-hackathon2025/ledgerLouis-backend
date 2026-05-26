import { type DB } from "../../types/db.js";
import { and, eq, isNull, type InferInsertModel } from "drizzle-orm";
import { users } from "../../database/schemas/index.js";

type UserInsert = InferInsertModel<typeof users>;

export const createUserRepository = (db: DB) => ({
  async create(data: UserInsert) {
    return db.insert(users).values(data);
  },

  async findByEmail(email: UserInsert["email"]) {
    return db.query.users.findFirst({
      where: (table, { eq }) => and(eq(table.email, email), isNull(table.deletedAt)),
    });
  },

  async findAll() {
    return db.query.users.findMany({
      where: (table, { isNull }) => isNull(table.deletedAt),
    });
  },
  async uploadAvatar(id: NonNullable<UserInsert["id"]>, avatar: string) {
    return db.
      update(users)
      .set({ avatar })
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
  },
  async delete(id: NonNullable<UserInsert["id"]>) {
    return db.
      update(users)
      .set({ deletedAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
  },

  async update(id: NonNullable<UserInsert["id"]>, data: Partial<UserInsert>) {
    return db.
      update(users)
      .set({ ...data})
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
  },


  async findById(id: NonNullable<UserInsert["id"]>) {
    return db.query.users.findFirst({
      where: (table, { eq }) => and(eq(table.id, id), isNull(table.deletedAt)),
    });
  },
});
