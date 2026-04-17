import { type FastifyInstance } from "fastify";

import { createKeyRepository } from "./repositories/key.repository";
import { createSessionRepository } from "./repositories/session.repository";
import { createRefreshRepository } from "./repositories/refresh.repository";

import { createKeyService } from "./services/key.service";
import { createSessionService } from "./services/session.service";
import { createRefreshService } from "./services/refresh.service";
import { createTokenService } from "./services/token.service";
import { createAuthService } from "./service";

export function buildAuthModule(app: FastifyInstance) {
  const db = app.db;

  const keyRepo = createKeyRepository(db);
  const sessionRepo = createSessionRepository(db);
  const refreshRepo = createRefreshRepository(db);

  const keyService = createKeyService(keyRepo);
  const sessionService = createSessionService(sessionRepo);
  const refreshService = createRefreshService(refreshRepo);
  const tokenService = createTokenService(keyService);

  const authService = createAuthService(
    tokenService,
    refreshService,
    sessionService,
  );

  return {
    authService,
    tokenService,
    sessionService,
    refreshService,
    keyService,
  };
}
