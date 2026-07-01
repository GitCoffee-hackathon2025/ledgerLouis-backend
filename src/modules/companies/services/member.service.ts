import type { createMemberRepository } from "../repositories/member.repository.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
import { type ULID } from "../../../domain/shared/id.js";
import { permissionsEnum } from "../../../shared/enums/index.js";
import type { createUserRepository } from "../../users/repository.js";

export const createMemberService = (
  memberRepo: ReturnType<typeof createMemberRepository>,
  userRepo: ReturnType<typeof createUserRepository>,
) => {
  async function assertMembership(companyId: ULID, userId: ULID) {
    // busca pela vinculação
    const membership = await memberRepo.findMembership(companyId, userId);
    if (!membership) throw new AppError("MEMBER_NOT_FOUND");

    return membership;
  }

  /**
   * Verifica a associação do usuário à empresa e, quando informado,
   * valida se sua role está entre as permitidas.
   */
  async function assertRole(
    companyId: ULID,
    userId: ULID,
    allowed?: (typeof permissionsEnum)[number][],
  ) {
    // valida permissão
    const membership = await assertMembership(companyId, userId);

    if (allowed && allowed.length > 0 && !allowed.includes(membership.role))
      throw new AppError("FORBIDDEN");

    return membership;
  }

  return {
    assertRole,

    async findAllMember(
      actorId: ULID,
      companyId: ULID,
      limit = 20,
      offset = 0,
    ) {
      await assertRole(companyId, actorId);

      return {
        items: await memberRepo.findAllByCompanyId(companyId, limit, offset),
        total: await memberRepo.countByCompanyId(companyId),
        limit,
        offset,
      };
    },

    async addMember(
      actorId: ULID,
      companyId: ULID,
      email: string,
      role: (typeof permissionsEnum)[number],
    ) {
      await assertRole(companyId, actorId, ["owner"]);

      // verifica se usuário existe e obtém seu id
      const user = await userRepo.findByEmail(email.trim());
      if (!user) throw new AppError("USER_NOT_FOUND");

      // verifica se existe conexão
      if (await memberRepo.findMembership(companyId, user.id))
        throw new AppError("MEMBER_ALREADY_EXISTS");

      // cria vinculação
      await memberRepo.create({
        companyId,
        userId: user.id,
        role,
      });

      return { targetUserId: user.id, companyId, role };
    },

    async findUserList(userId /* actorId */ : ULID) {
      return await memberRepo.findAllByUserId(userId);
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

      await memberRepo.changeRole(membership.id, role);

      return { targetUserId, companyId, role };
    },

    async removeMember(actorId: ULID, companyId: ULID, targetUserId: ULID) {
      // verifica se é o próprio usuário
      if (actorId !== targetUserId)
        await assertRole(companyId, actorId, ["owner"]);

      // busca pela vinculação
      const membership = await assertMembership(companyId, targetUserId);

      // verifica se o actor é o último owner
      if (
        actorId === targetUserId &&
        (await memberRepo.countOwners(companyId)) <= 1
      )
        throw new AppError("CANNOT_REMOVE_LAST_OWNER");

      await memberRepo.delete(membership.id);
    },
  };
};
