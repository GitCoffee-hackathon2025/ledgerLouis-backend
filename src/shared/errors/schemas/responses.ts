import { Type, type TSchema } from "@sinclair/typebox";
import { FieldErrorsSchema } from "../../../schemas/common/error.schema.js";
import { errorMap, type ErrorCode } from "../definitions/map.js";

type ErrorMessage<E extends ErrorCode> = (typeof errorMap)[E][1];

function createErrorSchema<E extends ErrorCode>(
  code: E,
  message: ErrorMessage<E>,
) {
  return Type.Object({
    error: Type.Literal(code),
    message: Type.Literal(message),
    ...(code === "VALIDATION_ERROR" ? { fields: FieldErrorsSchema } : {}),
  });
}

export function createErrorResponses<T extends ErrorCode[]>(errors: [...T]) {
  const grouped = new Map<number, TSchema[]>();

  for (const code of errors) {
    const [status, message] = errorMap[code];

    if (!grouped.has(status)) grouped.set(status, []);
    grouped.get(status)!.push(createErrorSchema(code, message));
  }

  return Object.fromEntries(
    [...grouped.entries()].map(([status, messages]) => [
      status,
      messages.length === 1 ? messages[0] : Type.Union(messages),
    ]),
  );
}