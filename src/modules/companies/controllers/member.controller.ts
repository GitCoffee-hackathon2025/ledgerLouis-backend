// PATCH /companies/:id/members/:userId/role

import type { FastifyReply, FastifyRequest } from "fastify";
import type { ULID } from "../../../domain/shared/id.js";
import type { createMemberService } from "../services/member.service.js";

type IdParamType = { id: ULID };

export const buildMemberRoutes = (
  member: ReturnType<typeof createMemberService>,
) => ({
  async create(req: FastifyRequest, res: FastifyReply) {
    const userId = req.authUser.sub;

    
  }

});
