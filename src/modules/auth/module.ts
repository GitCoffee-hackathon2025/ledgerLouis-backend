import type { DB } from "../../types/db.js";

import { createKeyRepository } from "./repositories/key.repository.js";
import { createSessionRepository } from "./repositories/session.repository.js";
import { createRefreshRepository } from "./repositories/refresh.repository.js";
import { createUserRepository } from "../users/repository.js";

import { createKeyService } from "./services/key.service.js";
import { createSessionService } from "./services/session.service.js";
import { createRefreshService } from "./services/refresh.service.js";
import { createTokenService } from "./services/token.service.js";
import { createAuthService } from "./service.js";

export function buildAuthModule(db: DB) {
  const keyRepo = createKeyRepository(db);
  const sessionRepo = createSessionRepository(db);
  const refreshRepo = createRefreshRepository(db);
  const userRepo = createUserRepository(db);

  const keyService = createKeyService(keyRepo);
  const sessionService = createSessionService(sessionRepo);
  const refreshService = createRefreshService(refreshRepo);
  const tokenService = createTokenService(keyService);

  const authService = createAuthService(
    tokenService,
    refreshService,
    sessionService,
    userRepo,
  );

  return {
    authService,
    tokenService,
    sessionService,
    refreshService,
    keyService,
  };
}
