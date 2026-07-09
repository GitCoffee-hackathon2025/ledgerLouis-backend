import type { FastifyReply, FastifyRequest } from "fastify";
import type { buildTransactionModule } from "../module.js";
import { toId } from "../../../domain/shared/id.js";

import type {
  CreateTransactionRoute,
  DeleteTransactionRoute,
  GetTransactionRoute,
  UpdateTransactionRoute,
} from "../schemas/transaction.schema.js";

export const createTransactionController = (
  transaction: ReturnType<typeof buildTransactionModule>["transactionService"],
) => ({
  async get(req: FastifyRequest<GetTransactionRoute>, res: FastifyReply) {
    const t = await transaction.find(toId(req.params.id), req.authUser.sub);
    return res.status(200).send(t);
  },

  async list(req: FastifyRequest, res: FastifyReply) {
    return res.status(200).send(await transaction.list(req.authUser.sub));
  },

  async create(req: FastifyRequest<CreateTransactionRoute>, res: FastifyReply) {
    const payload = req.body;
    return res.status(201).send(await transaction.create(req.authUser.sub, payload));
  },
  /*
  async update(req: FastifyRequest<UpdateTransactionRoute>, res: FastifyReply) {
    return res.status(200).send(await transaction.update(toId(req.params.id), req.authUser.sub, req.body));
  },
  */
  async delete(req: FastifyRequest<DeleteTransactionRoute>, res: FastifyReply) {
    await transaction.delete(toId(req.params.id), req.authUser.sub);
    return res.status(204).send();
  },
});
