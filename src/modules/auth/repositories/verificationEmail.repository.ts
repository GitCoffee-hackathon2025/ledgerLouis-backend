import { type DB } from "../../../types/db.js";
import { and, eq, isNull, type InferInsertModel } from "drizzle-orm";
import { verificationEmail } from "../../../database/schemas/index.js";

type VerificationEmailInsert = InferInsertModel<typeof verificationEmail>;

export const createVerificationEmailRepository = (db: DB) => ({
  async create(data: VerificationEmailInsert) {
    return db.insert(verificationEmail).values(data).returning();
  },

  async findById(id: NonNullable<VerificationEmailInsert["id"]>) {
    return db.query.verificationEmail.findFirst({
      where: (table, { eq }) => and(eq(table.id, id), isNull(table.deletedAt)),
    });
  },

  async findByUser(userId: NonNullable<VerificationEmailInsert["userId"]>) {
    return db.query.verificationEmail.findFirst({
      where: (table, { eq }) =>
        and(eq(table.userId, userId), isNull(table.deletedAt)),
    });
  },

  async findByUserAndTokenHash(
    userId: VerificationEmailInsert["userId"],
    tokenHash: NonNullable<VerificationEmailInsert["tokenHash"]>,
  ) {
    return db.query.verificationEmail.findFirst({
      where: (table, { eq }) =>
        and(
          eq(table.userId, userId),
          eq(table.tokenHash, tokenHash),
          isNull(table.deletedAt),
        ),
    });
  },

  async delete(id: NonNullable<VerificationEmailInsert["id"]>) {
    return db
      .update(verificationEmail)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(verificationEmail.id, id), isNull(verificationEmail.deletedAt)),
      )
      .returning({ id: verificationEmail.id });
  },
});
