import type { FastifyRequest, FastifyReply } from "fastify";

export const buildUserRoutes = () => ({
  async register(req: FastifyRequest, reply: FastifyReply) {
    const { user } = req.server;

    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const created = await user.userService.register(name, email, password);

    return reply.status(201).send({
      id: created.id,
      name: created.name,
      email: created.email,
    });
  },

  async login(req: FastifyRequest, reply: FastifyReply) {
    const { auth, user } = req.server;

    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const found = await user.userService.validateCredentials(email, password);

    const tokens = await auth.authService.login(found.id, {
      ipAddress: req.ip,
      ...(req.headers["user-agent"] && {
        userAgent: req.headers["user-agent"],
      }),
    });

    return reply.send(tokens);
  },
});
