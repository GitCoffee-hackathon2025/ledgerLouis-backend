import { createUserRepository } from "./repository.js";
import { AppError } from "../../shared/errors/index.js";
import {
  hashPassword,
  verifyPassword,
} from "../../shared/security/hash/password.js";
import { generateId } from "../../lib/id.js";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// function aaaaaaaaaaaaaaa(hash: string, password: string) {
//   const cleanHash = String(hash).trim();

//   if (!cleanHash.startsWith("$")) {
//     throw new Error("INVALID_HASH_FORMAT");
//   }

//   return verifyPassword(cleanHash, password);
// }

export const createUserService = (
  repo: ReturnType<typeof createUserRepository>,
) => ({
  async register(name: string, email: string, password: string) {
    email = normalizeEmail(email);

    const existing = await repo.findByEmail(email);

    if (existing) throw new AppError("EMAIL_ALREADY_EXISTS");

    const passwordHash = await hashPassword(password);

    const user = { id: generateId(), name, email, password: passwordHash };

    await repo.create(user);

    return user;
  },

  async validateCredentials(email: string, password: string) {
    email = normalizeEmail(email);
    const user = await repo.findByEmail(email);

    if (!user) throw new AppError("INVALID_CREDENTIALS");

    console.log("RAW:", Buffer.from(user.password));
    console.log("HEX:", Buffer.from(user.password).toString("hex"));

    // const valid = await verifyPassword(password, user.password);
    const valid = await verifyPassword(user.password, password);

    if (!valid) throw new AppError("INVALID_CREDENTIALS");

    return user;
  },
});
