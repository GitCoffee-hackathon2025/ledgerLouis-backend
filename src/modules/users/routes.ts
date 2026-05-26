import type { FastifyRequest, FastifyReply } from "fastify";
import type { buildUserModule } from "./module.js";
import type { RegisterBodyType, UpdateBodyType } from "./schema.js";
import type { ULID } from "../../lib/id.js";
import type { createAuthService } from "../auth/service.js";
import type { UploadAvatarBodyType} from './schema.js';
export const buildUserRoutes = (
  auth: ReturnType<typeof createAuthService>,
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
  
    if (!file) {
      return reply.status(400).send({
        message: "Arquivo obrigatório",
      });
    }
  
    const data = await user.userService.uploadUserAvatar(
      req.authUser.sub,
      file
    );
  
    return reply.status(200).send(data);
  },
  async getAll(req: FastifyRequest, reply: FastifyReply) {
    const users = await user.userService.getAll();
    return reply.status(200).send(users);
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    await auth.logoutAll(req.authUser.sub);
    await user.userService.delete(req.authUser.sub);
    return reply.status(204).send();
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.authUser.sub as ULID;
    const userData = await user.userService.getById(userId);
    if (userData === null || userData === undefined) {
      return reply.status(404).send({ message: "User not found" });
    }
    return reply.status(200).send(userData);
  },
});
