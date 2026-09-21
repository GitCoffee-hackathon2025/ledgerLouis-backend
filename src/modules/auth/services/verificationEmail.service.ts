import type { createVerificationEmailRepository } from "../repositories/verificationEmail.repository.js";
import type { createUserRepository } from "../../users/repositories/user.repository.js";
import type { buildEmailVerificationQueue } from "../queue/email-verification/index.js";

import type { ULID } from "../../../domain/shared/id.js";
import { generateToken, hashToken } from "../../../shared/security/token.js";

import { AppError } from "../../../shared/errors/domain/errors.js";

export const createVerificationService = (
  repo: ReturnType<typeof createVerificationEmailRepository>,
  userRepo: ReturnType<typeof createUserRepository>,
  verificationEmailProducer: ReturnType<typeof buildEmailVerificationQueue>,
) => {
  const path = "/users/register?token=";

  const EMAIL_VERIFICATION_EXPIRATION_MS = 60 * 60 * 1000;
  const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 3 * 60 * 1000;

  function calculateExpiresAt() {
    return new Date(Date.now() + EMAIL_VERIFICATION_EXPIRATION_MS);
  }

  async function sendVerificationEmail(userId: ULID, webUrl: string) {
    const token = generateToken();

    const [verification] = await repo.create({
      userId,
      tokenHash: hashToken(token),
      expiresAt: calculateExpiresAt(),
    });

    if (!verification) {
      throw new AppError("INTERNAL_ERROR");
    }

    await verificationEmailProducer.enqueue({
      userId,
      verificationUrl: webUrl + path + token,
    });

    return {
      expiresAt: verification.expiresAt.toISOString(),
      cooldown: new Date(
        Date.now() + EMAIL_VERIFICATION_RESEND_COOLDOWN_MS,
      ).toISOString(),
    };
  }

  return {
    /** Usado no /users/register automáticamente */
    async create(userId: ULID, webUrl: string) {
      const user = await userRepo.findById(userId);

      if (!user) throw new AppError("USER_NOT_FOUND");
      if (user.verifiedAt) throw new AppError("EMAIL_ALREADY_VERIFIED");

      return {
        ...(await sendVerificationEmail(userId, webUrl)),
        email: user.email,
      };
    },

    /* 
    Implementar limitador de execuções por usuário de acordo com o tempo - rateLimit
    */

    /** rota especifica */
    async resend(email: string, webUrl: string) {
      const user = await userRepo.findByEmail(email);

      if (!user) throw new AppError("USER_NOT_FOUND");
      if (user.verifiedAt) throw new AppError("EMAIL_ALREADY_VERIFIED");

      const verification = await repo.findByUser(user.id);

      if (!verification) throw new AppError("VERIFICATION_EMAIL_NOT_FOUND");

      if (
        verification.createdAt.getTime() >
        Date.now() - EMAIL_VERIFICATION_RESEND_COOLDOWN_MS
      )
        throw new AppError("EMAIL_VERIFICATION_COOLDOWN", {
          retryAfter: new Date(
            verification.createdAt.getTime() +
              EMAIL_VERIFICATION_RESEND_COOLDOWN_MS,
          ).toISOString(),
        });

      await repo.delete(verification.id);

      return {
        ...(await sendVerificationEmail(user.id, webUrl)),
        email: user.email,
      };
    },

    // /auth/login + Query do token
    async verify(userId: ULID, token: string) {
      const user = await userRepo.findById(userId);

      if (!user) throw new AppError("USER_NOT_FOUND");
      if (user.verifiedAt) throw new AppError("EMAIL_ALREADY_VERIFIED");

      const verification = await repo.findByUserAndTokenHash(
        user.id,
        hashToken(token),
      );

      if (!verification) throw new AppError("VERIFICATION_NOT_FOUND");

      if (new Date() >= verification.expiresAt)
        throw new AppError("VERIFICATION_EXPIRED");

      await userRepo.update(user.id, { verifiedAt: new Date() });
    },
  };
};
