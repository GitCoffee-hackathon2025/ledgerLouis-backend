import { createRefreshRepository } from "../repositories/refresh.repository.js";
import { hashToken, verifyToken } from "../../../shared/security/hash/token.js";
import { computeRefreshTokenExpiration } from "../auth.policy.js";

import { AppError } from "../../../shared/errors/index.js";
import { type ULID } from "../../../lib/id.js";

export const createRefreshService = (
  repo: ReturnType<typeof createRefreshRepository>,
) => ({
  /**
   * cria e salva refresh token
   */
  async create(
    {
      id,
      userId,
      sessionId,
    }: {
      id: ULID;
      userId: ULID;
      sessionId: ULID;
    },
    token: string,
  ) {
    return repo.saveRefresh({
      id,
      userId,
      sessionId,
      tokenHash: await hashToken(token),
      expiresAt: computeRefreshTokenExpiration(),
    });
  },
  /**
   * procura refresh pelo id
   */
  // async findById(jti: ULID) {
  //   return repo.findById(jti);
  // },
  /**
   * valida refresh token (fluxo principal)
   */
  async validate(token: string, jti: ULID) {
    const stored = await repo.findValidById(jti);

    if (!stored) throw new AppError("INVALID_TOKEN");

    if (!(await verifyToken(stored.tokenHash, token)))
      throw new AppError("INVALID_TOKEN");

    return stored;
  },

  /**
   * revoga token específico (por jti)
   */
  async revokeById(jti: ULID) {
    return repo.revokeById(jti);
  },

  /**
   * revoga todos os tokens do usuário
   */
  async revokeAllByUserId(userId: ULID) {
    return repo.revokeAllByUserId(userId);
  },

  /**
   * revoga todos os tokens da sessão
   */
  async revokeAllBySessionId(sessionId: ULID) {
    return repo.revokeAllBySessionId(sessionId);
  },
  /**
   * vincula o refresh novo com o antigo
   */
  async rotate(oldId: ULID, newId: ULID) {
    const result = await repo.markAsReplaced(oldId, newId);

    // PostgreSQL retorna um array com os registros afetados via .returning()
    if (!result || result.length === 0) {
      throw new AppError("TOKEN_REUSE_DETECTED");
    }
  },
});
