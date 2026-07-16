import { Type, type TObject, type TSchema } from "@sinclair/typebox";

import { errorMap, type ErrorCode } from "../definitions/map.js";
import { errorPayloadSchemas } from "../definitions/payloads.js";

function createErrorSchema<E extends ErrorCode>(code: E) {
  const [, message] = errorMap[code];

  const payload = errorPayloadSchemas[
    code as keyof typeof errorPayloadSchemas
  ] as TObject | undefined;

  return Type.Object({
    error: Type.Literal(code),
    message: Type.Literal(message),

    ...(payload?.properties ?? {}),
  });
}

export function createErrorResponses<T extends ErrorCode[]>(errors: [...T]) {
  const grouped = new Map<number, TSchema[]>();

  for (const code of errors) {
    const [status] = errorMap[code];
    const schema = createErrorSchema(code);

    if (!grouped.has(status)) grouped.set(status, []);

    grouped.get(status)!.push(schema);
  }

  return Object.fromEntries(
    [...grouped.entries()].map(([status, schemas]) => [
      status,
      schemas.length === 1 ? schemas[0] : Type.Union(schemas),
    ]),
  );
}
