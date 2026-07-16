import type { FastifyRequest, FastifyReply } from "fastify";
import type { buildAuthModule } from "./module.js";
import { AppError } from "../../shared/errors/domain/errors.js";
import type {
  LoginRoute,
  RefreshRoute,
  LogoutRoute,
  LogoutAllRoute,
} from "./schema.js";

export const createAuthController = (
  auth: ReturnType<typeof buildAuthModule>,
) => ({
  async login(req: FastifyRequest<LoginRoute>, res: FastifyReply) {
    const { email, password } = req.body;

    const tokens = await auth.authService.login(email, password, {
      ipAddress: req.ip,
      ...(req.headers["user-agent"] && {
        userAgent: req.headers["user-agent"],
      }),
    });
    return res.send(tokens);
  },

  async refresh(req: FastifyRequest<RefreshRoute>, res: FastifyReply) {
    const { refreshToken } = req.body;

    const tokens = await auth.authService.refresh(refreshToken);
    return res.send(tokens);
  },

  async logout(req: FastifyRequest<LogoutRoute>, res: FastifyReply) {
    if (!req.authUser) throw new AppError("UNAUTHORIZED");

    await auth.authService.logout(req.authUser.sid);
    return res.status(204).send();
  },

  async logoutAll(req: FastifyRequest<LogoutAllRoute>, res: FastifyReply) {
    if (!req.authUser) throw new AppError("UNAUTHORIZED");

    await auth.authService.logoutAll(req.authUser.sub);
    return res.status(204).send();
  },
});
