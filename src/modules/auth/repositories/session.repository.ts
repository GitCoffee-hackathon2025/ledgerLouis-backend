import { eq, type InferInsertModel } from "drizzle-orm";

import type { DB } from "../../../types/db.js";
import { sessions } from "../../../database/schemas/index.js";

type SessionInsert = InferInsertModel<typeof sessions>;

export const createSessionRepository = (db: DB) => ({
  /**
   * cria session
   */
  async saveSession(data: SessionInsert) {
    return db.insert(sessions).values(data);
  },
  /**
   * busca session pelo seu id
   */
  async findById(id: NonNullable<SessionInsert["id"]>) {
    return db.query.sessions.findFirst({
      where: (table, { eq }) => eq(table.id, id),
    });
  },
  /**
   * busca pela session válida
   */
  async findActiveById(id: NonNullable<SessionInsert["id"]>) {
    return db.query.sessions.findFirst({
      where: (table, { eq, isNull, gt, and }) =>
        and(
          eq(table.id, id),
          isNull(table.revokedAt),
          gt(table.expiresAt, new Date()),
        ),
    });
  },
  /**
   * busca sessions do user
   */
  async findByUserId(userId: SessionInsert["userId"]) {
    return db.query.sessions.findMany({
      where: (table, { eq }) => eq(table.userId, userId),
    });
  },
  /**
   * revoga session
   */
  async revokeSession(id: NonNullable<SessionInsert["id"]>) {
    return db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, id));
  },
  /**
   * revoga TODAS as sessions do user
   */
  async revokeAllByUserId(userId: SessionInsert["userId"]) {
    return db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.userId, userId));
  },
  /**
   * atualiza à última vez que session foi usado
   */
  async touch(id: NonNullable<SessionInsert["id"]>) {
    return db
      .update(sessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(sessions.id, id));
  },
});
