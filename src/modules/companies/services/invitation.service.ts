import type { createInviteRepository } from "../repositories/invite.repository.js";
import type { createMemberRepository } from "../repositories/member.repository.js";
import type { createUserRepository } from "../../users/repositories/user.repository.js";

import type { createMemberService } from "./member.service.js";
import type { createMemberInvitationProducer } from "../queues/member-invitation/producer.js";

import { AppError } from "../../../shared/errors/domain/errors.js";
import { type ULID } from "../../../domain/shared/id.js";
import { permissionsEnum } from "../../../domain/organization/enums.js";

import { createHash, randomBytes } from "node:crypto";

export const createInvitationService = (
  inviteRepo: ReturnType<typeof createInviteRepository>,
  memberRepo: ReturnType<typeof createMemberRepository>,
  userRepo: ReturnType<typeof createUserRepository>,
  invitationProducer: ReturnType<typeof createMemberInvitationProducer>,
  assertRole: ReturnType<typeof createMemberService>["assertRole"],
) => {
  const INVITATION_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

  function generateToken() {
    return randomBytes(32).toString("base64url");
  }

  function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  async function findByToken(token: string) {
    const invite = await inviteRepo.findByTokenHash(hashToken(token));

    if (!invite) throw new AppError("INVITATION_NOT_FOUND");

    if (invite.acceptedAt) throw new AppError("INVITATION_ALREADY_ACCEPTED");

    if (invite.revokedAt) throw new AppError("INVITATION_REVOKED");

    if (invite.expiresAt <= new Date())
      throw new AppError("INVITATION_EXPIRED");

    return invite;
  }

  return {
    async create(
      actorId: ULID,
      companyId: ULID,
      email: string,
      role: (typeof permissionsEnum)[number],
      invitationUrl: string,
    ) {
      // somente owner pode convidar
      await assertRole(companyId, actorId, ["owner"]);

      const normalizedEmail = email.trim().toLowerCase();

      // verifica se o usuário já existe
      await userRepo.findByEmail(normalizedEmail).then(async (user) => {
        // se existir, verifica se já pertence à companhia
        if (user && (await memberRepo.findMembership(companyId, user.id)))
          throw new AppError("MEMBER_ALREADY_EXISTS");
      });

      // evita múltiplos convites pendentes para o mesmo e-mail
      await inviteRepo
        .findPendingByCompanyAndEmail(companyId, normalizedEmail)
        .then(async (outstanding) => {
          if (outstanding) await inviteRepo.revoke(outstanding.id);
        });

      const token = generateToken();

      const invite = await inviteRepo.create({
        companyId,
        invitedBy: actorId,
        email: normalizedEmail,
        role,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + INVITATION_EXPIRATION_MS),
      });

      if (!invite) throw new AppError("INTERNAL_ERROR");

      /* 
      O token bruto não deve ser persistido.
      
      O worker precisa dele para construir a URL,
      então o producer deve receber o token apenas neste momento.
      */
      await invitationProducer.enqueue({
        invitationId: invite.id,
        invitationUrl: invitationUrl + "/" + token,
      });

      return {
        id: invite.id,
        companyId: invite.companyId,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      };
    },

    async read(userId: ULID, token: string) {
      const invite = await findByToken(token);

      const user = await userRepo.findById(userId);
      if (!user) throw new AppError("USER_NOT_FOUND");

      if (user.email !== invite.email) throw new AppError("FORBIDDEN");

      return {
        companyId: invite.companyId,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      };
    },

    async list(actorId: ULID, companyId: ULID, limit = 20, offset = 0) {
      await assertRole(companyId, actorId, ["owner"]);

      return {
        companyId,
        items: await inviteRepo.findAllByCompanyId(companyId, limit, offset),
        total: await inviteRepo.countByCompanyId(companyId),
        limit,
        offset,
      };
    },

    async accept(userId: ULID, token: string) {
      const invite = await findByToken(token);

      const user = await userRepo.findById(userId);

      if (!user) throw new AppError("USER_NOT_FOUND");

      // o convite é destinado ao e-mail específico
      if (user.email.toLowerCase() !== invite.email)
        throw new AppError("INVITATION_EMAIL_MISMATCH");

      // proteção contra associação duplicada
      const existingMembership = await memberRepo.findMembership(
        invite.companyId,
        userId,
      );

      if (existingMembership) throw new AppError("MEMBER_ALREADY_EXISTS");

      await memberRepo.create({
        companyId: invite.companyId,
        userId,
        role: invite.role,
      });

      if (!(await inviteRepo.markAsAccepted(invite.id)))
        throw new AppError("INVITATION_ALREADY_ACCEPTED");

      return {
        companyId: invite.companyId,
        userId,
        role: invite.role,
      };
    },

    async revoke(actorId: ULID, companyId: ULID, invitationId: ULID) {
      await assertRole(companyId, actorId, ["owner"]);

      const invite = await inviteRepo.findById(invitationId);

      if (!invite || invite.companyId !== companyId)
        throw new AppError("INVITATION_NOT_FOUND");

      if (invite.acceptedAt) throw new AppError("INVITATION_ALREADY_ACCEPTED");

      if (invite.revokedAt) throw new AppError("INVITATION_REVOKED");

      const revokedInvite = await inviteRepo.revoke(invitationId);

      if (!revokedInvite) throw new AppError("INVITATION_NOT_FOUND");

      return revokedInvite;
    },
  };
};
