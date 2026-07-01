import type { FastifyRequest, FastifyReply } from "fastify";
import type { buildUserModule } from "./module.js";

import type { buildAuthModule } from "../auth/module.js";
import type { RegisterBodyType, UpdateBodyType } from "./schema.js";
import { AppError } from "../../shared/errors/index.js";

export const buildUserRoutes = (
  authService: ReturnType<typeof buildAuthModule>["authService"],
  user: ReturnType<typeof buildUserModule>,
) => ({
  async register(req: FastifyRequest, reply: FastifyReply) {
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
  async update(req: FastifyRequest, reply: FastifyReply) {
    const { name, email } = req.body as UpdateBodyType;
    const data = await user.userService.update(req.authUser.sub, {
      name,
      email,
    });
    return reply.status(200).send(data);
  },
  async uploadAvatar(req: FastifyRequest, reply: FastifyReply) {
    const file = await req.file();

    if (!file) throw new AppError("FILE_REQUIRED");

    const data = await user.userService.uploadUserAvatar(
      req.authUser.sub,
      file,
    );

    return reply.status(200).send(data);
  },
  async getAll(req: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send(await user.userService.getAll());
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    await authService.logoutAll(req.authUser.sub);
    await user.userService.delete(req.authUser.sub);
    return reply.status(204).send();
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const userData = await user.userService.getById(req.authUser.sub);
    if (!userData) throw new AppError("USER_NOT_FOUND");

    return reply.status(200).send(userData);
  },
});
