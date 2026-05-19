import { Type } from "@sinclair/typebox";
import { createErrorSchema } from "../../schemas/common/error.schema.js";
import { errorMap, type ErrorCode } from "./errorMap.js";

export function createErrorResponses<const T extends ErrorCode[]>(
  errors: [...T],
) {
  const grouped = new Map<number, any[]>();

  for (const code of errors) {
    const [status] = errorMap[code];

    if (!grouped.has(status)) {
      grouped.set(status, []);
    }

    grouped.get(status)!.push(createErrorSchema(code));
  }

  return Object.fromEntries(
    [...grouped.entries()].map(([status, schemas]) => [
      status,
      schemas.length === 1 ? schemas[0] : Type.Union(schemas),
    ]),
  );
}
