import type { FastifyInstance } from "fastify";

import { createUserRepository } from "./repository.js";
import { createUserService } from "./service.js";

import { buildAuthModule } from "../auth/module.js";
import { buildUploaderModule } from "../uploader/module.js";

export function buildUserModule(app: FastifyInstance) {
  const repo = createUserRepository(app.db);

  const auth = buildAuthModule(app);
  const uploader = buildUploaderModule(app.db, app.storage);

  const userService = createUserService(repo, auth.authService, uploader);

  return {
    userService,
  };
}
