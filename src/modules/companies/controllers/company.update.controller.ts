import type { FastifyReply, FastifyRequest } from "fastify";
import type { buildCompanyModule } from "../module.js";
import { toId } from "../../../domain/shared/id.js";

import type { UpdateCompanyRoute } from "../schemas/company.schema.js";

export const createCompanyUpdateController = (
  update: ReturnType<
    typeof buildCompanyModule
  >["company"]["companyUpdateService"],
) => ({
  async updateName(
    req: FastifyRequest<UpdateCompanyRoute<"name">>,
    res: FastifyReply,
  ) {
    return res
      .status(200)
      .send(
        await update.updateName(
          toId(req.params.companyId),
          req.authUser.sub,
          req.body.name,
        ),
      );
  },

  async updateEmail(
    req: FastifyRequest<UpdateCompanyRoute<"email">>,
    res: FastifyReply,
  ) {
    return res
      .status(200)
      .send(
        await update.updateEmail(
          toId(req.params.companyId),
          req.authUser.sub,
          req.body.email,
        ),
      );
  },

  async updateCep(
    req: FastifyRequest<UpdateCompanyRoute<"cep">>,
    res: FastifyReply,
  ) {
    return res
      .status(200)
      .send(
        await update.updateCep(
          toId(req.params.companyId),
          req.authUser.sub,
          req.body.cep,
        ),
      );
  },

  async updatePhone(
    req: FastifyRequest<UpdateCompanyRoute<"phone">>,
    res: FastifyReply,
  ) {
    return res
      .status(200)
      .send(
        await update.updatePhone(
          toId(req.params.companyId),
          req.authUser.sub,
          req.body.phone,
        ),
      );
  },
});
