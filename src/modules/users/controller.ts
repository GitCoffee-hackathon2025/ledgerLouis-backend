import type { FastifyRequest, FastifyReply } from "fastify";
import type { buildUserModule } from "./module.js";

export const createUserController = (user: ReturnType<typeof buildUserModule>) => ({
  async register(req: FastifyRequest, res: FastifyReply) {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const created = await user.userService.register(name, email, password);

    return res.status(201).send(created);
  },
});
