import { createUserRepository } from "./repository.js";
import { AppError } from "../../shared/errors/index.js";
import { hashPassword } from "../../shared/security/hash/password.js";
import { generateId, type ULID } from "../../lib/id.js";
import type { RegisterBodyType, UpdateBodyType } from "./schema.js";
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
  async update(id: ULID, user: Partial<UpdateBodyType>) {
    // Futuro: troca de email, vai enviar um e-mail para o novo para confirmar a troca
    // Futuro: troca de senha, também vai enviar um e-mail
    // Esses dois vão ter rotas proprias
    if (user.email) {
      user.email = normalizeEmail(user.email);
    }
    const existingUser = await repo.findById(id);
    if (existingUser)
      throw new AppError("EMAIL_ALREADY_EXISTS");
    await repo.update(id, user);

    // if (partialUser.password)
    //   partialUser.password = await hashPassword(partialUser.password);

    return { id, ...user };
  },
  async getAll(){
    console.log("FETCHING ALL USERS");
    return repo.findAll();
  },

  async delete(id: ULID) {
    await repo.delete(id);
  },
  
  async getById(id: ULID){
    await repo.findById(id);
  },
});

