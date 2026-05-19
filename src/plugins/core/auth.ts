import fp from "fastify-plugin";
import { type FastifyInstance } from "fastify";

import { AppError } from "../../shared/errors/basicErrors.js";

import { buildAuthModule } from "../../modules/auth/module.js";
import { startKeyRotation } from "../../modules/auth/services/scheduler.service.js";

export default fp(
  async function (app: FastifyInstance) {
    const auth = buildAuthModule(app);
    const scheduler = startKeyRotation(auth.keyService);
    await scheduler.start();

    app.decorate("auth", auth);

    app.decorate("verifyAccess", async function (request, reply) {
      const header = request.headers.authorization;

      if (!header?.startsWith("Bearer ")) throw new AppError("UNAUTHORIZED");

      const token = header.slice(7);

      const payload = await auth.authService.verifyAccess(token);

      request.authUser = payload;
    });
  },
  {
    name: "auth",
    dependencies: ["db"],
  },
);
