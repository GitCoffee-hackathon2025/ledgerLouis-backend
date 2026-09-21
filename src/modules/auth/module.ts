import type { DB } from "../../types/db.js";
import type { Redis } from "../../types/redis.js";

import { createKeyRepository } from "./repositories/key.repository.js";
import { createSessionRepository } from "./repositories/session.repository.js";
import { createRefreshRepository } from "./repositories/refresh.repository.js";
import { createUserRepository } from "../users/repositories/user.repository.js";

import { createKeyService } from "./services/key.service.js";
import { createSessionService } from "./services/session.service.js";
import { createRefreshService } from "./services/refresh.service.js";
import { createTokenService } from "./services/token.service.js";
import { createAuthService } from "./service.js";

import { buildEmailVerificationQueue } from "./queue/email-verification/index.js";
import { createVerificationEmailRepository } from "./repositories/verificationEmail.repository.js";
import { createVerificationService } from "./services/verificationEmail.service.js";

export function buildAuthModule(db: DB, redis: Redis["adapter"]) {
  const keyRepo = createKeyRepository(db);
  const sessionRepo = createSessionRepository(db);
  const refreshRepo = createRefreshRepository(db);
  const userRepo = createUserRepository(db);

  const keyService = createKeyService(keyRepo);
  const sessionService = createSessionService(sessionRepo);
  const refreshService = createRefreshService(refreshRepo);
  const tokenService = createTokenService(keyService);

  const emailProducer = buildEmailVerificationQueue(redis);
  const emailRepo = createVerificationEmailRepository(db);
  const emailService = createVerificationService(
    emailRepo,
    userRepo,
    emailProducer,
  );

  const authService = createAuthService(
    tokenService,
    refreshService,
    sessionService,
    emailService,
    userRepo,
  );


  return {
    authService,
    keyService,
    emailService,
  };
}
