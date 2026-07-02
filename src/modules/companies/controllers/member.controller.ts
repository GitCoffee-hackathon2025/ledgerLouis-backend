import type { FastifyReply, FastifyRequest } from "fastify";

import { toId } from "../../../domain/shared/id.js";
import type { createMemberService } from "../services/member.service.js";

import type {
  AddMemberRoute,
  ChangeMemberRoleRoute,
  ListMembersRoute,
  RemoveMemberRoute,
} from "../schemas/member.schema.js";

export const createMemberController = (
  member: ReturnType<typeof createMemberService>,
) => ({
  async list(req: FastifyRequest<ListMembersRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(
        await member.findAllMember(
          req.authUser.sub,
          toId(req.params.companyId),
          req.query.limit,
          req.query.offset,
        ),
      );
  },

  async listUserCompanies(req: FastifyRequest, res: FastifyReply) {
    return res.status(200).send(await member.findUserList(req.authUser.sub));
  },

  async add(req: FastifyRequest<AddMemberRoute>, res: FastifyReply) {
    return res
      .status(201)
      .send(
        await member.addMember(
          req.authUser.sub,
          toId(req.params.companyId),
          req.body.email,
          req.body.role,
        ),
      );
  },

  async changeRole(
    req: FastifyRequest<ChangeMemberRoleRoute>,
    res: FastifyReply,
  ) {
    return res
      .status(200)
      .send(
        await member.changeMemberRole(
          req.authUser.sub,
          toId(req.params.companyId),
          toId(req.params.userId),
          req.body.role,
        ),
      );
  },

  async remove(req: FastifyRequest<RemoveMemberRoute>, res: FastifyReply) {
    await member.removeMember(
      req.authUser.sub,
      toId(req.params.companyId),
      toId(req.params.userId),
    );

    return res.status(204).send();
  },
});
