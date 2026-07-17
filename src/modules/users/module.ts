import type { DB } from "../../types/db.js";
import type { Storage } from "../../types/storage.js";

import { createUserRepository } from "./repository.js";
import { createUserService } from "./service.js";

import { buildAuthModule } from "../auth/module.js";
import { buildUploaderModule } from "../uploader/module.js";

export function buildUserModule(db: DB, storage: Storage) {
  const repo = createUserRepository(db);

  const auth = buildAuthModule(db);
  const uploader = buildUploaderModule(db, storage);

  const userService = createUserService(repo, auth.authService, uploader);

  return {
    userService,
  };
}
