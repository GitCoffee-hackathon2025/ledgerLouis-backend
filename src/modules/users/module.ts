import type { FastifyInstance } from "fastify";

import { createUserRepository } from "./repository.js";
import { createUserService } from "./service.js";

export function buildUserModule(app: FastifyInstance) {
  const repo = createUserRepository(app.db);
  const userService = createUserService(repo);

  return {
    userService,
  };
}
