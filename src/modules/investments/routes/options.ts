import type { FastifyInstance, FastifySchema } from "fastify";
import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";
import type { ErrorCode } from "../../../shared/errors/definitions/map.js";

/** Opções comuns das rotas de investimentos: todas exigem login e documentam os erros possíveis. */
export const secured = (
  app: FastifyInstance,
  summary: string,
  schema: FastifySchema = {},
  errors: ErrorCode[] = [],
) => ({
  preHandler: app.verifyAccess,
  config: { auth: true as const },
  schema: {
    tags: ["investments"],
    summary,
    ...schema,
    response: createErrorResponses([
      ...routeGroups.common,
      ...routeGroups.auth,
      ...(schema.body ? routeGroups.form : []),
      ...errors,
    ]),
  },
});
