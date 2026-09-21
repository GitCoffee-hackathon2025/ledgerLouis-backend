import type { FastifyInstance } from "fastify";
import { buildAuthModule } from "./module.js";
import { authRouter } from "./routes/auth.router.js";
import { verificationEmailRouter } from "./routes/verificationEmail.router.js";

export default async function (app: FastifyInstance) {
  const module = buildAuthModule(app.db, app.redis.adapter);

  await app.register(authRouter(module.authService), {
    prefix: "/auth",
  });

  await app.register(verificationEmailRouter(module.emailService), {
    prefix: "/auth/email-verification",
  })
}
