import type { FastifyReply, FastifyRequest } from "fastify";

import type { buildUserModule } from "../module.js";
import type {
  DeleteRoute,
  GetMeRoute,
  RegisterRoute,
  UpdateRoute,
} from "../schema.js";

import { AppError } from "../../../shared/errors/domain/errors.js";

export const createUserController = (
  userService: ReturnType<typeof buildUserModule>["userService"],
) => ({
  async register(req: FastifyRequest<RegisterRoute>, reply: FastifyReply) {
    const { name, email, password } = req.body;

    const created = await userService.register(name, email, password);

    return reply.status(201).send(created);
  },

  async update(req: FastifyRequest<UpdateRoute>, reply: FastifyReply) {
    const { name, email } = req.body;

    const updated = await userService.update(req.authUser.sub, {
      name,
      email,
    });

    return reply.status(200).send(updated);
  },

  async getMe(req: FastifyRequest<GetMeRoute>, reply: FastifyReply) {
    const user = await userService.findById(req.authUser.sub);

    if (!user) throw new AppError("USER_NOT_FOUND");

    return reply.status(200).send(user);
  },

  async delete(req: FastifyRequest<DeleteRoute>, reply: FastifyReply) {
    await userService.delete(req.authUser.sub);

    return reply.status(204).send();
  },
});
