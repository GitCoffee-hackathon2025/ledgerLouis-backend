import type { FastifyReply, FastifyRequest } from "fastify";
import type { buildTransactionModule } from "../module.js";
import { toId } from "../../../domain/shared/id.js";

import type {
  GetRecurringRoute,
  ListRecurringRoute,
  CreateRecurringRoute,
  UpdateRecurringRoute,
  DeleteRecurringRoute,
  RunRecurringRoute,
} from "../schemas/recurringTransaction.schema.js";

export const createRecurringTransactionController = (
  recurring: ReturnType<typeof buildTransactionModule>["recurringTransactionService"],
) => ({
  async get(req: FastifyRequest<GetRecurringRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(
        await recurring.find(
          toId(req.params.companyId),
          req.authUser.sub,
          toId(req.params.id),
        ),
      );
  },

  async list(req: FastifyRequest<ListRecurringRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(await recurring.list(toId(req.params.companyId), req.authUser.sub));
  },

  async create(req: FastifyRequest<CreateRecurringRoute>, res: FastifyReply) {
    return res
      .status(201)
      .send(
        await recurring.create(
          toId(req.params.companyId),
          req.authUser.sub,
          req.body,
        ),
      );
  },

  async update(req: FastifyRequest<UpdateRecurringRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(
        await recurring.update(
          toId(req.params.companyId),
          req.authUser.sub,
          toId(req.params.id),
          req.body,
        ),
      );
  },

  async delete(req: FastifyRequest<DeleteRecurringRoute>, res: FastifyReply) {
    await recurring.delete(
      toId(req.params.companyId),
      req.authUser.sub,
      toId(req.params.id),
    );
    return res.status(204).send();
  },

  async run(req: FastifyRequest<RunRecurringRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(
        await recurring.run(
          toId(req.params.companyId),
          req.authUser.sub,
          toId(req.params.id),
        ),
      );
  },
});
