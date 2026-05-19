import type { FastifyReply, FastifyRequest } from "fastify";
import type { buildCompanyModule } from "../module.js";
import { AppError } from "../../../shared/errors/index.js";
import { toId } from "../../../lib/id.js";

import type {
  CreateCompanyRoute,
  DeleteCompanyRoute,
  GetCompanyRoute,
  UpdateCompanyRoute,
} from "../schemas/company.schema.js";

export const createCompanyController = (
  company: ReturnType<typeof buildCompanyModule>,
) => ({
  async get(req: FastifyRequest<GetCompanyRoute>, res: FastifyReply) {
    const comp = await company.find(toId(req.params.id));
    if (!comp) throw new AppError("COMPANY_NOT_FOUND");

    return res.status(200).send(comp);
  },

  async list(req: FastifyRequest, res: FastifyReply) {
    return res.status(200).send(await company.list());
  },

  async create(req: FastifyRequest<CreateCompanyRoute>, res: FastifyReply) {
    const { name, cnpj } = req.body;
    return res.status(201).send(await company.create(name, cnpj));
  },

  async update(req: FastifyRequest<UpdateCompanyRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(await company.update(toId(req.params.id), req.body.name));
  },

  async delete(req: FastifyRequest<DeleteCompanyRoute>, res: FastifyReply) {
    await company.delete(toId(req.params.id));
    return res.status(204).send();
  },
});
