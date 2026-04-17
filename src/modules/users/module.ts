import { FastifyInstance } from "fastify";

import { createUserRepository } from "./repository";
import { createUserService } from "./service";

export function buildUserModule(app: FastifyInstance) {
  const repo = createUserRepository(app.db);
  const userService = createUserService(repo);

  return {
    userService,
  };
}
