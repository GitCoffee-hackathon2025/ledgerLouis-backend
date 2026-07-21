import type { FastifyReply, FastifyRequest } from "fastify";

import { handleFastifyError } from "../adapters/fastify.mapper.js";
import { isAjvError } from "../../../infrastructure/validation/ajv/errors/isAjvError.js";
import { transformAjvErrors } from "../../../infrastructure/validation/ajv/errors/transformAjvErrors.js";
import { AppError } from "../domain/errors.js";

export function handleError(
  error: unknown,
  req: FastifyRequest,
  res: FastifyReply,
) {
  const code = (error as { code: string })?.code;

  // AJV
  if (isAjvError(error))
    return res.status(400).send({
      error: "VALIDATION_ERROR",
      message: "Invalid input",
      fields: transformAjvErrors(error.validation),
    });

  if (typeof code === "string" && code.startsWith("FST_"))
    error = handleFastifyError(error);

  // AppError
  if (error instanceof AppError) {
    const { statusCode, code, message, ...payload } = error;

    return res.status(statusCode).send({ error: code, message, ...payload });
  }

  // fallback
  req.log.error(error);

  return res.status(500).send({
    error: "INTERNAL_ERROR",
    message: "Internal server error",
  });
}
