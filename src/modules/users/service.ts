import { createUserRepository } from "./repository.js";
import { AppError } from "../../shared/errors/index.js";
import { hashPassword } from "../../shared/security/hash/password.js";
import { generateId, type ULID } from "../../lib/id.js";
import type { RegisterBodyType } from "./schema.js";
import { register } from "node:module";

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

export const updateUserService = (repo : ReturnType<typeof createUserRepository>) => ({
  async update(id : ULID, partialUser: Partial<RegisterBodyType>) {
    if (partialUser.email) {
      partialUser.email = normalizeEmail(partialUser.email);
      const existingUser = await repo.findByEmail(partialUser.email);
      if (existingUser)
        throw new AppError("EMAIL_ALREADY_EXISTS");
    }
    if (partialUser.password) {
      partialUser.password = await hashPassword(partialUser.password);
    }
    
    await repo.update(id, partialUser);
  }
})