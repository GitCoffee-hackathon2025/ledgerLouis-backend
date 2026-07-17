import fp from "fastify-plugin";
import { type FastifyInstance } from "fastify";

import { AppError } from "../../shared/errors/domain/errors.js";

import { buildAuthModule } from "../../modules/auth/module.js";
import { startKeyRotation } from "../../modules/auth/services/scheduler.service.js";

export default fp(
  async function (app: FastifyInstance) {
    const auth = buildAuthModule(app.db);
    const scheduler = startKeyRotation(auth.keyService);
    await scheduler.start();

    // app.decorate("auth", auth);

    app.decorate("verifyAccess", async function (req, res) {
      const header = req.headers.authorization;

      if (!header?.startsWith("Bearer ")) throw new AppError("UNAUTHORIZED");

      const token = header.slice(7);

      const payload = await auth.authService.verifyAccess(token);

      await app.limiter.assert(res, {
        by: "user",
        id: payload.sub,
        max: 250,
        window: 60,
      });

      req.authUser = payload;
    });
  },
  {
    name: "auth",
    dependencies: ["env", "db", "rateLimit"],
  },
);
