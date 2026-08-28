import type { FastifyReply, FastifyRequest } from "fastify";
import type { buildTagModule } from "../module.js";
import { toId } from "../../../domain/shared/id.js";

import type {
  GetTagRoute,
  ListTagsRoute,
  CreateTagRoute,
  UpdateTagRoute,
  DeleteTagRoute,
} from "../schemas/tag.schema.js";

export const createTagController = (
  tag: ReturnType<typeof buildTagModule>["tagService"],
) => ({
  async get(req: FastifyRequest<GetTagRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(
        await tag.find(
          toId(req.params.companyId),
          req.authUser.sub,
          toId(req.params.id),
        ),
      );
  },

  async list(req: FastifyRequest<ListTagsRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(await tag.list(toId(req.params.companyId), req.authUser.sub));
  },

  async create(req: FastifyRequest<CreateTagRoute>, res: FastifyReply) {
    return res
      .status(201)
      .send(
        await tag.create(
          toId(req.params.companyId),
          req.authUser.sub,
          req.body.name,
        ),
      );
  },

  async update(req: FastifyRequest<UpdateTagRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(
        await tag.update(
          toId(req.params.companyId),
          req.authUser.sub,
          toId(req.params.id),
          req.body.name,
        ),
      );
  },

  async delete(req: FastifyRequest<DeleteTagRoute>, res: FastifyReply) {
    await tag.delete(
      toId(req.params.companyId),
      req.authUser.sub,
      toId(req.params.id),
    );
    return res.status(204).send();
  },
});
