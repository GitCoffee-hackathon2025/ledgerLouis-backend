import type { FastifyReply } from "fastify";

export function handleFastifyError(error: any, reply: FastifyReply) {
  switch (error.code) {
    case "FST_ERR_CTP_INVALID_MEDIA_TYPE":
      return reply.status(415).send({
        error: "UNSUPPORTED_MEDIA_TYPE",
        message: "Content-Type must be application/json",
      });

    case "FST_ERR_CTP_INVALID_JSON_BODY":
      return reply.status(400).send({
        error: "INVALID_JSON",
        message: "Malformed JSON body",
      });

    case "FST_ERR_VALIDATION":
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Invalid input",
      });

    default:
      return reply.status(error.statusCode || 400).send({
        error: "BAD_REQUEST",
        message: error.message || "Request error",
      });
  }
}
