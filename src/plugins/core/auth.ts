import fp from "fastify-plugin";
import { type FastifyInstance } from "fastify";

import { AppError } from "../../shared/errors";

import { buildAuthModule } from "../../modules/auth/module";
import { startKeyRotation } from "../../modules/auth/services/scheduler.service";

export default fp(
  async function (app: FastifyInstance) {
    const auth = buildAuthModule(app);
    const scheduler = startKeyRotation(auth.keyService);
    await scheduler.start();

    app.decorate("auth", auth);

    app.decorate("verifyAccessToken", async function (request, reply) {
      const header = request.headers.authorization;

      if (!header?.startsWith("Bearer ")) throw new AppError("UNAUTHORIZED");

      const token = header.slice(7);

      const payload = await auth.authService.verifyAccessToken(token);

      request.authUser = payload;
    });
  },
  {
    name: "auth",
    dependencies: ["db"],
  },
);
