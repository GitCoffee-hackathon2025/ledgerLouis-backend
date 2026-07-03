import type { FastifyInstance } from "fastify";

import { createUserRepository } from "./repository.js";
import { createUserService } from "./service.js";

import { buildUploaderModule } from "../uploader/module.js";

export function buildUserModule(app: FastifyInstance) {
  const repo = createUserRepository(app.db);
  const uploader = buildUploaderModule(app.db, app.storage);
  const userService = createUserService(repo, uploader);

  return {
    userService,
  };
}
