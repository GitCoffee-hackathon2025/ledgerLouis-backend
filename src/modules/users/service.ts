import { createUserRepository } from "./repository.js";
import { AppError } from "../../shared/errors/index.js";
import { hashPassword } from "../../shared/security/hash/password.js";
import { generateId } from "../../lib/id.js";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const createUserService = (
  repo: ReturnType<typeof createUserRepository>,
) => ({
  async register(name: string, email: string, password: string) {
    email = normalizeEmail(email);

    if (await repo.findByEmail(email))
      throw new AppError("EMAIL_ALREADY_EXISTS");

    const passwordHash = await hashPassword(password);

    const user = { id: generateId(), name, email, password: passwordHash };

    await repo.create(user);

    return user;
  },
});
