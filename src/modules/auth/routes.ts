import type { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../../shared/errors/index.js";

export const buildAuthRoutes = () => ({
  async login(req: FastifyRequest, reply: FastifyReply) {
    const { auth } = req.server;

    const { email, password } = req.body as { email: string; password: string };

    const tokens = await auth.authService.login(email, password, {
      ipAddress: req.ip,
      ...(req.headers["user-agent"] && {
        userAgent: req.headers["user-agent"],
      }),
    });

    return reply.send(tokens);
  },

  async refresh(req: FastifyRequest, reply: FastifyReply) {
    const { auth } = req.server;

    const { refreshToken } = req.body as { refreshToken: string };

    const tokens = await auth.authService.refresh(refreshToken);

    return reply.send(tokens);
  },

  async logout(req: FastifyRequest, reply: FastifyReply) {
    const { auth } = req.server;

    if (!req.authUser) throw new AppError("UNAUTHORIZED");

    await auth.authService.logout(req.authUser.sid);

    return reply.status(204).send();
  },

  async logoutAll(req: FastifyRequest, reply: FastifyReply) {
    const { auth } = req.server;

    if (!req.authUser) throw new AppError("UNAUTHORIZED");

    await auth.authService.logoutAll(req.authUser.sub);

    return reply.status(204).send();
  },
});
