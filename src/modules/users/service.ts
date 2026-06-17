import { createUserRepository } from "./repository.js";
import { AppError } from "../../shared/errors/domain/errors.js";
import { hashPassword } from "../../shared/security/hash/password.js";
import { generateId } from "../../domain/shared/id.js";
import { isUniqueConstraint } from "../../infrastructure/database/errors/isUniqueConstraint.js";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const createUserService = (
  repo: ReturnType<typeof createUserRepository>,
) => ({
  async register(name: string, email: string, password: string) {
    email = normalizeEmail(email);

    const passwordHash = await hashPassword(password);
    const id = generateId();

    try {
      await repo.create({ id, name, email, password: passwordHash });
    } catch (error) {
      if (isUniqueConstraint(error, "users_email_unique"))
        throw new AppError("EMAIL_ALREADY_EXISTS");
      throw error;
    }

    return { id, name, email };
  },
});
