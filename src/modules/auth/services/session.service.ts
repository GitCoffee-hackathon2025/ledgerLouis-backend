import { computeSessionTokenExpiration } from "../auth.policy.js";
import { createSessionRepository } from "../repositories/session.repository.js";
import { type ULID } from "../../../lib/id.js";
import { AppError } from "../../../shared/errors/basicErrors.js";

export const createSessionService = (
  repo: ReturnType<typeof createSessionRepository>,
) => ({
  /**
   * Registra o session no banco
   */
  async create(
    { id, userId }: { id: ULID; userId: ULID },
    { ipAddress, userAgent }: { ipAddress?: string; userAgent?: string },
  ) {
    return repo.saveSession({
      id,
      userId,
      ipAddress,
      userAgent,
      expiresAt: computeSessionTokenExpiration(),
    });
  },
  /**
   * Procura session de acordo com seu Id
   */
  // findById(sessionId: ULID) {
  //   return repo.findById(sessionId);
  // },

  async assertActive(sessionId: ULID) {
    const session = await repo.findActiveById(sessionId);

    if (!session) throw new AppError("INVALID_TOKEN");

    return session;
  },
  /**
   * Procura session de acordo com userId
   */
  findByUserId(userId: ULID) {
    return repo.findByUserId(userId);
  },
  /**
   * Revoga session
   */
  revoke(sessionId: ULID) {
    return repo.revokeSession(sessionId);
  },
  /**
   * Revoga TODOS os sessions do user
   */
  revokeAll(userId: ULID) {
    return repo.revokeAllByUserId(userId);
  },
  /**
   * Atualiza a atividade do session
   */
  touch(sessionId: ULID) {
    return repo.touch(sessionId);
  },
});
