import type { MultipartFile }
  from "@fastify/multipart";

import { createUserRepository }
  from "./repository.js";

import { AppError }
  from "../../shared/errors/index.js";

import { hashPassword }
  from "../../shared/security/hash/password.js";

import {
  generateId,
  type ULID,
} from "../../lib/id.js";

import type {
  UpdateBodyType,
} from "./schema.js";

import type {
  buildUploaderModule,
} from "../uploader/module.js";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const createUserService = (
  repo: ReturnType<typeof createUserRepository>,

  uploader: ReturnType<
    typeof buildUploaderModule
  >,
) => ({
  async register(
    name: string,
    email: string,
    password: string
  ) {
    email = normalizeEmail(email);

    if (await repo.findByEmail(email)) {
      throw new AppError(
        "EMAIL_ALREADY_EXISTS"
      );
    }

    const passwordHash =
      await hashPassword(password);

    const user = {
      id: generateId(),
      name,
      email,
      password: passwordHash,
    };

    await repo.create(user);

    return user;
  },

  async uploadUserAvatar(
    id: ULID,
    file: MultipartFile
  ) {
    const user = await repo.findById(id);

    if (!user) {
      throw new AppError(
        "KEY_NOT_FOUND"
      );
    }

    const uploaded =
      await uploader
        .uploadService
        .uploadImage(file);

    // temporário
    // depois vai virar
    // user_profile_images
    const url = `${process.env.BASE_URL}/${uploaded.path}`;
    console.log("URL da imagem:", url);
    await repo.uploadAvatar(
      id,
      url
    );

    return { fileId: uploaded.id, avatarUrl: url};
  },

  async update(
    id: ULID,
    user: Partial<UpdateBodyType>
  ) {
    if (user.email) {
      user.email =
        normalizeEmail(user.email);

      const existingUser =
        await repo.findByEmail(
          user.email
        );

      if (
        existingUser &&
        existingUser.id !== id
      ) {
        throw new AppError(
          "EMAIL_ALREADY_EXISTS"
        );
      }
    }

    await repo.update(id, user);

    return {
      id,
      ...user,
    };
  },

  async getAll() {
    return repo.findAll();
  },

  async delete(id: ULID) {
    await repo.delete(id);
  },

  async getById(id: ULID) {
    return repo.findById(id);
  },
});