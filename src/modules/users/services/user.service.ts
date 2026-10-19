import type { createUserRepository } from "../repositories/user.repository.js";
import type { createUserInvitationService } from "../../companies/services/invitation.service.js";
import type { buildAuthModule } from "../../auth/module.js";

import { AppError } from "../../../shared/errors/domain/errors.js";
import { getUniqueConstraint } from "../../../infrastructure/database/errors/getUniqueConstraint.js";

import { type ULID } from "../../../domain/shared/id.js";
import {
  hashPassword,
  verifyPassword,
} from "../../../shared/security/hash/password.js";

export const createUserService = (
  repo: ReturnType<typeof createUserRepository>,
  authService: ReturnType<typeof buildAuthModule>["authService"],
  emailService: ReturnType<typeof buildAuthModule>["emailService"],
  invitationService: ReturnType<typeof createUserInvitationService>,
) => ({
  async register(
    {
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    },
    webUrl: string,
    invite?: string,
  ) {
    // usuário criado
    const [user] = await repo
      .create({
        name: name.trim(),
        email: email.trim(),
        password: await hashPassword(password),
      })
      .catch((error) => {
        // caso der erro, verifica se foi erro de duplicação
        if (getUniqueConstraint(error, ["uq_users_email"]))
          throw new AppError("EMAIL_ALREADY_EXISTS");
        throw error;
      });

    if (!user) throw new AppError("INTERNAL_ERROR");

    // variavel a situação da vinculação do usuário
    let nextStep;

    if (invite) {
      // caso tenha algum convite, é aceitado pela compania, após validação
      const { userId, ...registrationResult } = await invitationService.accept(
        user.id,
        { by: "token", value: invite },
      );

      // se aceitado, usuário é declarado como verificado automáticamente
      // isso se deve porque o convite passou pela caixa postal do usuário
      await repo.update(user.id, { verifiedAt: new Date() });

      nextStep = { type: "company_linked" as const, ...registrationResult };
    } else {
      // caso não tenha convite, é enviado um email de verificação na caixa postal
      const { email, ...registrationResult } = await emailService.create(
        user.id,
        webUrl,
      );
      nextStep = { type: "email_verification" as const, ...registrationResult };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      nextStep,
    };
  },

  async findById(id: ULID) {
    return repo.findById(id);
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
    } else if (user.name) user.name = user.name.trim();

    const [updatedUser] = await repo.update(id, user);

    if (!updatedUser) throw new AppError("USER_NOT_FOUND");

    return updatedUser;
  },

  async delete(id: ULID) {
    await authService.logoutAll(id);
    await repo.delete(id);
  },
});
