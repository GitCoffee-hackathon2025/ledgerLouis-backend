import type { FastifyReply, FastifyRequest } from "fastify";

import type { buildUserModule } from "../module.js";
import type {
  UploadProfileImageRoute,
  OpenProfileImageRoute,
  DeleteProfileImageRoute,
} from "../schema.js";

import { AppError } from "../../../shared/errors/domain/errors.js";

export const createProfileImageController = (
  profileImageService: ReturnType<
    typeof buildUserModule
  >["profileImageService"],
) => ({
  async upload(
    req: FastifyRequest<UploadProfileImageRoute>,
    res: FastifyReply,
  ) {
    const multipart = await req.file();

    if (!multipart) throw new AppError("FILE_REQUIRED");

    if (!multipart.mimetype.startsWith("image/"))
      throw new AppError("INVALID_FILE_TYPE");

    const image = await profileImageService.upload(req.authUser.sub, {
      originalName: multipart.filename,
      mimeType: multipart.mimetype,
      size: multipart.file.bytesRead,
      file: multipart.file,
    });

    return res.status(201).send(image);
  },

  async open(req: FastifyRequest<OpenProfileImageRoute>, res: FastifyReply) {
    const resource = await profileImageService.open(req.authUser.sub);

    switch (resource.type) {
      case "stream":
        return res.status(200).send(resource.stream);

      case "redirect":
        return res.status(302).redirect(resource.url);
    }
  },

  async delete(
    req: FastifyRequest<DeleteProfileImageRoute>,
    res: FastifyReply,
  ) {
    await profileImageService.delete(req.authUser.sub);

    return res.status(204).send();
  },
});
