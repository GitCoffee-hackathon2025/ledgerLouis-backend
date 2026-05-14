import type { FastifyRequest, FastifyReply } from "fastify";
import type { buildCompanyModule } from "../module.js";
import { AppError } from "../../../shared/errors/index.js";
import type { CreateBodyType, UpdateBodyType } from "../schema.js";
import type { ULID } from "../../../lib/id.js";

type IdParamType = { id: ULID };

export const buildCompanyRoutes = (
  company: ReturnType<typeof buildCompanyModule>,
) => ({
  async create(req: FastifyRequest, res: FastifyReply) {
    const { name, cnpj } = req.body as CreateBodyType;

    return res.status(201).send(await company.create(name, cnpj));
  },

  async update(req: FastifyRequest, res: FastifyReply) {
    const { id } = req.params as IdParamType;
    const { name } = req.body as UpdateBodyType;

    return res.status(200).send(await company.update(id, name));
  },

  async get(req: FastifyRequest, res: FastifyReply) {
    const { id } = req.params as IdParamType;
    const comp = await company.find(id);

    if (!comp) throw new AppError("COMPANY_NOT_FOUND");

    return res.status(200).send(comp);
  },

  async list(req: FastifyRequest, res: FastifyReply) {
    return res.status(200).send(await company.list());
  },

  async delete(req: FastifyRequest, res: FastifyReply) {
    const { id } = req.params as IdParamType;
    
    await company.delete(id);

    return res.status(204).send();
  },
});
