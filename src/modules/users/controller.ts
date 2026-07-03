import type { FastifyRequest, FastifyReply } from "fastify";
import type { buildUserModule } from "./module.js";
import type { buildAuthModule } from "../auth/module.js";
import type {
  RegisterRoute,
  UpdateRoute,
  UploadAvatarRoute,
  ListRoute,
  DeleteRoute,
  GetMeRoute,
} from "./schema.js";
import { AppError } from "../../shared/errors/domain/errors.js";

export const createUserController = (
  authService: ReturnType<typeof buildAuthModule>["authService"],
  user: ReturnType<typeof buildUserModule>,
) => ({
  async register(req: FastifyRequest<RegisterRoute>, res: FastifyReply) {
    const { name, email, password } = req.body;

    const created = await user.userService.register(name, email, password);

    return res.status(201).send(created);
  },

  async update(req: FastifyRequest<UpdateRoute>, reply: FastifyReply) {
    const { name, email } = req.body;
    const data = await user.userService.update(req.authUser.sub, {
      name,
      email,
    });
    return reply.status(200).send(data);
  },

  async uploadAvatar(
    req: FastifyRequest<UploadAvatarRoute>,
    reply: FastifyReply,
  ) {
    const file = await req.file();

    if (!file) throw new AppError("FILE_REQUIRED");

    const data = await user.userService.uploadUserAvatar(
      req.authUser.sub,
      file,
    );

    return reply.status(200).send(data);
  },

  /// TEMPORARIO ESSE LIST
  async list(req: FastifyRequest<ListRoute>, reply: FastifyReply) {
    return reply.status(200).send(await user.userService.list());
  },

  async delete(req: FastifyRequest<DeleteRoute>, reply: FastifyReply) {
    await authService.logoutAll(req.authUser.sub);
    await user.userService.delete(req.authUser.sub);
    return reply.status(204).send();
  },

  /// NÃO SERÁ FEITO ATRÁVES DAQUI - METODO PARA MEMBERS
  async getById(req: FastifyRequest<GetMeRoute>, reply: FastifyReply) {
    const userData = await user.userService.getById(req.authUser.sub);
    if (!userData) throw new AppError("USER_NOT_FOUND");

    return reply.status(200).send(userData);
  },
});
