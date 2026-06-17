import type { FastifyReply, FastifyRequest } from "fastify";

import { handleFastifyError } from "../adapters/fastify.adapter.js";
import { isAjvError } from "../../../infrastructure/validation/ajv/errors/isAjvError.js";
import { transformAjvErrors } from "../../../infrastructure/validation/ajv/errors/transformAjvErrors.js";
import { AppError } from "../domain/errors.js";

export function handleError(
  error: unknown,
  req: FastifyRequest,
  res: FastifyReply,
) {
  const code = (error as { code: string })?.code;

  if (typeof code === "string" && code.startsWith("FST_"))
    return handleFastifyError(error, res);

  // AJV
  if (isAjvError(error))
    return res.status(400).send({
      error: "VALIDATION_ERROR",
      message: "Invalid input",
      fields: transformAjvErrors(error.validation),
    });

  // AppError
  if (error instanceof AppError)
    return res.status(error.statusCode).send({
      error: error.code,
      message: error.message,
    });

  // fallback
  req.log.error(error);

  return res.status(500).send({
    error: "INTERNAL_ERROR",
    message: "Internal server error",
  });
}
