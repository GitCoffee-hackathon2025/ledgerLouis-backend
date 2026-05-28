import type { createMemberRepository } from "../repositories/member.repository.js";
import { AppError } from "../../../shared/errors/basicErrors.js";
import { type ULID } from "../../../domain/shared/id.js";
import { permissionsEnum } from "../../../shared/enums/index.js";

export const createMemberService = (
  repo: ReturnType<typeof createMemberRepository>,
) => {
  async function assertMembership(companyId: ULID, userId: ULID) {
    // busca pela vinculação
    const membership = await repo.findMembership(companyId, userId);
    if (!membership) throw new AppError("MEMBER_NOT_FOUND");

    return membership;
  }

  async function assertRole(
    companyId: ULID,
    userId: ULID,
    allowed: (typeof permissionsEnum)[number][],
  ) {
    // valida permissão
    const membership = await assertMembership(companyId, userId);

    if (!allowed.includes(membership.role)) throw new AppError("FORBIDDEN");

    return membership;
  }

  return {
    async hasRole(...args: Parameters<typeof assertRole>) {
      await assertRole(...args);
    },

    async findAllMember(companyId: ULID, limit = 20, offset = 0) {
      return {
        items: await repo.findAllByCompanyId(companyId, limit, offset),
        total: await repo.countByCompanyId(companyId),
        limit,
        offset,
      };
    },

    async findUserList(userId /* actorId */ : ULID) {
      return await repo.findAllByUserId(userId);
    },

    async addMember(
      actorId: ULID,
      companyId: ULID,
      targetUserId: ULID,
      role: (typeof permissionsEnum)[number],
    ) {
      await assertRole(companyId, actorId, ["owner"]);

      // verifica se existe conexão
      if (await repo.findMembership(companyId, targetUserId))
        throw new AppError("MEMBER_ALREADY_EXISTS");

      // cria vinculação
      await repo.create({
        companyId,
        userId: targetUserId,
        role,
      });

      return { targetUserId, companyId, role };
    },

    async removeMember(actorId: ULID, companyId: ULID, targetUserId: ULID) {
      // verifica se é o próprio usuário
      if (actorId !== targetUserId)
        await assertRole(companyId, actorId, ["owner"]);

      // busca pela vinculação
      const membership = await assertMembership(companyId, targetUserId);

      // verifica se o actor é o último owner
      if (actorId === targetUserId && (await repo.countOwners(companyId)) <= 1)
        throw new AppError("CANNOT_REMOVE_LAST_OWNER");

      await repo.delete(membership.id);
    },

    async changeMemberRole(
      actorId: ULID,
      companyId: ULID,
      targetUserId: ULID,
      role: (typeof permissionsEnum)[number],
    ) {
      // usuário não pode mudar sua própria autoridade
      if (actorId === targetUserId)
        throw new AppError("CANNOT_CHANGE_OWN_ROLE");

      await assertRole(companyId, actorId, ["owner"]);

      const membership = await assertMembership(companyId, targetUserId);

      await repo.changeRole(membership.id, role);

      return { targetUserId, companyId, role };
    },
  };
};
