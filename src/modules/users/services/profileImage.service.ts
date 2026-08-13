import { AppError } from "../../../shared/errors/domain/errors.js";
import type { ULID } from "../../../domain/shared/id.js";

import type { createProfileImageRepository } from "../repositories/profileImage.repository.js";
import type { buildFileModule, CreateFileInput } from "../../files/module.js";

export const createProfileImageService = (
  repo: ReturnType<typeof createProfileImageRepository>,
  filesService: ReturnType<typeof buildFileModule>,
) => ({
  async upload(userId: ULID, file: CreateFileInput) {
    const current = await repo.findByUserId(userId);

    const { file: stream, ...fileDescriptor } = file;

    // substitui a foto anterior
    if (current) {
      await filesService.delete(current.fileId);
      await repo.deleteByUserId(userId);
    }

    const stored = await filesService.create(fileDescriptor, {
      folder: "profile-images",
      filename: `${userId}`,
      file: stream,
    });

    if (!stored) throw new AppError("INTERNAL_ERROR");

    const [profileImage] = await repo.create({
      userId,
      fileId: stored.id,
    });

    return profileImage;
  },

  async open(userId: ULID) {
    const profileImage = await repo.findByUserId(userId);

    if (!profileImage) throw new AppError("PROFILE_IMAGE_NOT_FOUND");

    return filesService.open(profileImage.fileId);
  },

  async delete(userId: ULID) {
    const profileImage = await repo.findByUserId(userId);

    if (!profileImage) throw new AppError("PROFILE_IMAGE_NOT_FOUND");

    await filesService.delete(profileImage.fileId);

    await repo.deleteByUserId(userId);
  },
});
