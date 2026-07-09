import type { FastifyReply, FastifyRequest } from "fastify";
import type { buildTransactionModule } from "../module.js";
import { toId } from "../../../domain/shared/id.js";

import type {
  CreateTransactionRoute,
  DeleteTransactionRoute,
  GetTransactionRoute,
} from "../schemas/transaction.schema.js";
import type { ULID } from "ulid";

export const createTransactionController = (
  transaction: ReturnType<typeof buildTransactionModule>["transactionService"],
) => ({
  async get(req: FastifyRequest<GetTransactionRoute>, res: FastifyReply) {
    // Agora validamos o ID da transação no contexto daquela empresa específica
    const { companyId, id } = req.params as any; 
    const t = await transaction.find(toId(id), toId(companyId), req.authUser.sub);
    return res.status(200).send(t);
  },

  async list(req: FastifyRequest, res: FastifyReply) {
    const { companyId } = req.params as any;
    return res.status(200).send(await transaction.list(req.authUser.sub, { companyId: toId(companyId) }));
  },

  async create(req: FastifyRequest<CreateTransactionRoute>, res: FastifyReply) {
  const { companyId } = req.params as any;
  const payload = req.body;

  const transactionData = {
  ...payload,
  companyId: toId(companyId),
  ...(payload.projectId && {
    projectId: toId(payload.projectId),
  }),
};
  return res
    .status(201)
    .send(await transaction.create(req.authUser.sub, transactionData));
},

  async delete(req: FastifyRequest<DeleteTransactionRoute>, res: FastifyReply) {
    const { companyId, id } = req.params as any;
    await transaction.delete(toId(id), toId(companyId), req.authUser.sub);
    return res.status(204).send();
  },
  async getAccountValue(req: FastifyRequest<{ Params: { companyId: string } }>, res: FastifyReply) {
    // 1. Pegamos explicitamente o parâmetro tipado
    const { companyId } = req.params;
    
    console.log("=== DEBUG CONTROLLER ===");
    console.log("Conteúdo real de req.params:", req.params);
    console.log("Valor extraído de companyId:", companyId);
    console.log("Valor extraído do usuário (sub):", req.authUser?.sub);

    // 2. Chamamos o serviço usando a variável renomeada
    const accountValue = await transaction.getAccountValue(
      toId(companyId), 
      req.authUser.sub
    );
    
    return res.status(200).send({ value: accountValue });
  },
});