import { and, eq, gt, isNull, type InferInsertModel } from "drizzle-orm";

import type { DB } from "../../../types/db.js";
import { refreshTokens } from "../../../database/schemas/index.js";

type RefreshInsert = InferInsertModel<typeof refreshTokens>;

export const createRefreshRepository = (db: DB) => ({
  /**
   * salva novo refresh token (login ou rotação)
   */
  async saveRefresh(data: RefreshInsert) {
    return db.insert(refreshTokens).values(data);
  },

  /**
   * busca por id (jti) SEM filtro (usado para segurança/reuse detection)
   */
  // async findById(id: NonNullable<RefreshInsert["id"]>) {
  //   return db.query.refreshTokens.findFirst({
  //     where: (table, { eq }) => eq(table.id, id),
  //   });
  // },

  /**
   * busca apenas tokens válidos
   */
  async findValidById(id: NonNullable<RefreshInsert["id"]>) {
    return db.query.refreshTokens.findFirst({
      where: (table, { eq, isNull, gt, and }) =>
        and(
          eq(table.id, id),
          isNull(table.revokedAt),
          gt(table.expiresAt, new Date()),
        ),
    });
  },

  /**
   * revoga UM token específico
   */
  async revokeById(id: NonNullable<RefreshInsert["id"]>) {
    return db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.id, id), isNull(refreshTokens.revokedAt)))
      .returning({ id: refreshTokens.id });
  },

  /**
   * revoga TODOS os tokens de um usuário
   */
  async revokeAllByUserId(userId: RefreshInsert["userId"]) {
    return db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      )
      .returning({ id: refreshTokens.id });
  },

  /**
   * revoga TODOS os tokens de uma sessão
   */
  async revokeAllBySessionId(sessionId: RefreshInsert["sessionId"]) {
    return db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.sessionId, sessionId),
          isNull(refreshTokens.revokedAt),
        ),
      )
      .returning({ id: refreshTokens.id });
  },
  /**
   * vincula o refresh novo com o antigo
   */
  async markAsReplaced(
    oldId: NonNullable<RefreshInsert["replacedBy"]>,
    newId: NonNullable<RefreshInsert["id"]>,
  ) {
    return db
      .update(refreshTokens)
      .set({
        revokedAt: new Date(),
        replacedBy: newId,
      })
      .where(
        and(
          eq(refreshTokens.id, oldId),
          isNull(refreshTokens.revokedAt),
          isNull(refreshTokens.replacedBy),
        ),
      )
      .returning({ id: refreshTokens.id });
  },
});
