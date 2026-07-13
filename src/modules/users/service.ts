import type { MultipartFile } from "@fastify/multipart";
import type { buildUploaderModule } from "../uploader/module.js";

import { createUserRepository } from "./repository.js";
import { generateId, type ULID } from "../../domain/shared/id.js";
import { hashPassword } from "../../shared/security/hash/password.js";
import { getUniqueConstraint } from "../../infrastructure/database/errors/getUniqueConstraint.js";
import { AppError } from "../../shared/errors/domain/errors.js";

export const createUserService = (
  repo: ReturnType<typeof createUserRepository>,
  uploader: ReturnType<typeof buildUploaderModule>,
) => ({
  async register(name: string, email: string, password: string) {
    email = email.trim();

    const id = generateId();

    try {
      await repo.create({
        id,
        name,
        email,
        password: await hashPassword(password),
      });
    } catch (error) {
      if (getUniqueConstraint(error, ["uq_users_email"]))
        throw new AppError("EMAIL_ALREADY_EXISTS");
      throw error;
    }

    return { id, name, email };
  },
  async uploadUserAvatar(id: ULID, file: MultipartFile) {
    const user = await repo.findById(id);
    if (!user) throw new AppError("USER_NOT_FOUND");

  const uploaded = await uploader.uploadImage(file);

  let url: string;
  if(uploaded.provider === "cloudinary") {
    //// É TRABALHO DO UPLOADER CUIDAR DA URL, OS MODULOS DEVEM APENAS CHAMAR E RECEBER DEVOLTA A URL OU MELHOR DIZENDO ID DA TABELA QUE CONTÉM O PATH
    url = uploaded.path; 
  } else {
    url = `${process.env.BASE_URL}/${uploaded.path}`;
  }
  
  


  console.log("URL da imagem:", url);
  await repo.uploadAvatar(id, url);

  return { fileId: uploaded.id, avatarUrl: url };
  },
  async update(id: ULID, user: Partial<{ name: string; email: string }>) {
    if (user.email) {
      /// ALERTA
      user.email = user.email.trim();

      const existingUser = await repo.findByEmail(user.email);

      if (existingUser && existingUser.id !== id)
        throw new AppError("EMAIL_ALREADY_EXISTS");
    }
    if (user.name) user.name = user.name.trim();

    await repo.update(id, user);

    return { id, ...user };
  },

  /// TESTES - MUITO CUIDADO
  async list() {
    return repo.findAll();
  },

  async delete(id: ULID) {
    await repo.delete(id);
  },

  async getById(id: ULID) {
    return repo.findById(id);
  },
});
