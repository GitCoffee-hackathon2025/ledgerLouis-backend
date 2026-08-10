import { AppError } from "../../../shared/errors/domain/errors.js";
import { generateId, type ULID } from "../../../domain/shared/id.js";
import { getUniqueConstraint } from "../../../infrastructure/database/errors/getUniqueConstraint.js";
import {
  hashPassword,
  verifyPassword,
} from "../../../shared/security/hash/password.js";

import type { createUserRepository } from "../repositories/user.repository.js";
import type { buildAuthModule } from "../../auth/module.js";

export const createUserService = (
  repo: ReturnType<typeof createUserRepository>,
  authService: ReturnType<typeof buildAuthModule>["authService"],
) => ({
  async register(name: string, email: string, password: string) {
    name = name.trim();
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

  async findById(id: ULID) {
    return repo.findById(id);
  },

  async verifyEmail(id: ULID) {
    await repo.update(id, { isVerified: new Date() });
  },

  async changePassword(
    id: ULID,
    {
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    const user = await repo.findById(id);

    if (!user) throw new AppError("USER_NOT_FOUND");

    /* 
    Futuramente implementar o uso de "envio de código de verificação pro email"
    */

    if (!(await verifyPassword(user.password, currentPassword)))
      throw new AppError("INVALID_TOKEN"); // Criar erro de senha invalida

    await repo.update(id, { password: await hashPassword(newPassword) });
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

  async delete(id: ULID) {
    await authService.logoutAll(id);
    await repo.delete(id);
  },
});
