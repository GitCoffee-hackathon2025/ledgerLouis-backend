import { createTokenService } from "./services/token.service.js";
import { createSessionService } from "./services/session.service.js";
import { createRefreshService } from "./services/refresh.service.js";
import type { createUserRepository } from "../users/repository.js";

import { AppError } from "../../shared/errors/index.js";
import { type ULID, generateId } from "../../lib/id.js";
import { verifyPassword } from "../../shared/security/hash/password.js";

export const createAuthService = (
  tokenService: ReturnType<typeof createTokenService>,
  refreshService: ReturnType<typeof createRefreshService>,
  sessionService: ReturnType<typeof createSessionService>,
  userRepo: ReturnType<typeof createUserRepository>,
) => ({
  /**
   * LOGIN
   */
  async login(
    email: string,
    password: string,
    ctx: { ipAddress?: string; userAgent?: string },
  ) {
    // procura pelo user
    const user = await userRepo.findByEmail(email.trim().toLowerCase());

    if (!user) throw new AppError("INVALID_CREDENTIALS");

    // valida senha
    if (!(await verifyPassword(user.password, password)))
      throw new AppError("INVALID_CREDENTIALS");

    const userId = user.id;

    // cria sessão
    const sessionId = generateId();
    await sessionService.create({ id: sessionId, userId }, ctx);

    // gera tokens
    const access = await tokenService.signAccessToken({
      sub: userId,
      sid: sessionId,
    });

    const refreshId = generateId();
    const refresh = await tokenService.signRefreshToken({
      sub: userId,
      sid: sessionId,
      jti: refreshId,
    });

    // salva refresh no banco
    await refreshService.create(
      {
        id: refreshId,
        userId,
        sessionId,
      },
      refresh.token,
    );

    return {
      accessToken: access.token,
      refreshToken: refresh.token,
    };
  },

  /**
   * REFRESH (com rotação segura)
   */
  async refresh(refreshToken: string) {
    const { sub, sid, jti } =
      await tokenService.verifyRefreshToken(refreshToken);

    await refreshService.validate(refreshToken, jti);

    await sessionService.assertActive(sid);

    const newRefreshId = generateId();

    await refreshService.rotate(jti, newRefreshId);

    const access = await tokenService.signAccessToken({ sub, sid });

    const newRefresh = await tokenService.signRefreshToken({
      sub,
      sid,
      jti: newRefreshId,
    });

    // salva novo refresh
    await refreshService.create(
      { id: newRefreshId, userId: sub, sessionId: sid },
      newRefresh.token,
    );

    return {
      accessToken: access.token,
      refreshToken: newRefresh.token,
    };
  },
  /**
   * LOGOUT (sessão atual)
   */
  async logout(sessionId: ULID) {
    await refreshService.revokeAllBySessionId(sessionId);
    await sessionService.revoke(sessionId);
  },

  /**
   * LOGOUT GLOBAL
   */
  async logoutAll(userId: ULID) {
    await sessionService.revokeAll(userId);
    await refreshService.revokeAllByUserId(userId);
  },

  /**
   * VERIFY ACCESS TOKEN
   */
  async verifyAccessToken(token: string) {
    const payload = await tokenService.verifyAccessToken(token);
    await sessionService.touch(payload.sid);

    await sessionService.assertActive(payload.sid);

    return payload;
  },
});
