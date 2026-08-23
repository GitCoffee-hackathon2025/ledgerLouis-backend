import type { FastifyReply, FastifyRequest } from "fastify";
import type { buildTagModule } from "../module.js";
import { toId } from "../../../domain/shared/id.js";

import type {
  ListTransactionTagsRoute,
  AttachTagRoute,
  DetachTagRoute,
} from "../schemas/transactionTag.schema.js";

export const createTransactionTagController = (
  transactionTag: ReturnType<typeof buildTagModule>["transactionTagService"],
) => ({
  async list(
    req: FastifyRequest<ListTransactionTagsRoute>,
    res: FastifyReply,
  ) {
    return res
      .status(200)
      .send(
        await transactionTag.list(
          toId(req.params.companyId),
          req.authUser.sub,
          toId(req.params.transactionId),
        ),
      );
  },

  async attach(req: FastifyRequest<AttachTagRoute>, res: FastifyReply) {
    return res
      .status(201)
      .send(
        await transactionTag.attach(
          toId(req.params.companyId),
          req.authUser.sub,
          toId(req.params.transactionId),
          toId(req.body.tagId),
        ),
      );
  },

  async detach(req: FastifyRequest<DetachTagRoute>, res: FastifyReply) {
    await transactionTag.detach(
      toId(req.params.companyId),
      req.authUser.sub,
      toId(req.params.transactionId),
      toId(req.params.tagId),
    );
    return res.status(204).send();
  },
});
