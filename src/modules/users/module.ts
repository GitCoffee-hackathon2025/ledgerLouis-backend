import type { DB } from "../../types/db.js";
import type { Redis } from "../../types/redis.js";
import type { StorageProvider } from "../../types/storage.js";

import { createUserRepository } from "./repositories/user.repository.js";
import { createUserService } from "./services/user.service.js";

import { createProfileImageRepository } from "./repositories/profileImage.repository.js";
import { createProfileImageService } from "./services/profileImage.service.js";

import { buildAuthModule } from "../auth/module.js";
import { buildFileModule } from "../files/module.js";

export function buildUserModule(
  db: DB,
  redis: Redis["adapter"],
  storage: StorageProvider,
) {
  const auth = buildAuthModule(db, redis);
  const files = buildFileModule(db, storage);

  const userRepo = createUserRepository(db);
  const userService = createUserService(
    userRepo,
    auth.authService,
    auth.emailService,
  );

  const profileImageRepo = createProfileImageRepository(db);
  const profileImageService = createProfileImageService(
    profileImageRepo,
    files,
  );

  return {
    userService,
    profileImageService,
  };
}
