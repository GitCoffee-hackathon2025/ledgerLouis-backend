import type { FastifyReply, FastifyRequest } from "fastify";
import type { buildCompanyModule } from "../module.js";
import { toId } from "../../../domain/shared/id.js";

import type {
  CreateCompanyRoute,
  DeleteCompanyRoute,
  GetCompanyRoute,
} from "../schemas/company.schema.js";

export const createCompanyController = (
  company: ReturnType<typeof buildCompanyModule>["company"]["companyService"],
) => ({
  async get(req: FastifyRequest<GetCompanyRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(await company.find(toId(req.params.companyId), req.authUser.sub));
  },

  async list(req: FastifyRequest, res: FastifyReply) {
    return res.status(200).send(await company.list());
  },

  async create(req: FastifyRequest<CreateCompanyRoute>, res: FastifyReply) {
    const { name, cnpj, email, cep, phone } = req.body;
    return res.status(201).send(
      await company.create(req.authUser.sub, {
        name,
        cnpj,
        email,
        cep,
        phone,
      }),
    );
  },

  async delete(req: FastifyRequest<DeleteCompanyRoute>, res: FastifyReply) {
    await company.delete(toId(req.params.companyId), req.authUser.sub);
    return res.status(204).send();
  },
});
