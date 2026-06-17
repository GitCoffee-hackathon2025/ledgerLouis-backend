import { Type, type TSchema } from "@sinclair/typebox";
import { errorMap, type ErrorCode } from "../definitions/map.js";

type ErrorMessage<E extends ErrorCode> = (typeof errorMap)[E][1];

const specialErrors: Partial<Record<ErrorCode, TSchema>> = {
  VALIDATION_ERROR: Type.Object({
    error: Type.Literal("VALIDATION_ERROR"),
    message: Type.Literal(errorMap.VALIDATION_ERROR[1]),
    fields: Type.Record(Type.String(), Type.Array(Type.String())),
  }),
};

function createErrorSchema<E extends ErrorCode>(
  code: E,
  message: ErrorMessage<E>,
) {
  return Type.Object({
    error: Type.Literal(code),
    message: Type.Literal(message),
  });
}

export function createErrorResponses<T extends ErrorCode[]>(errors: [...T]) {
  const grouped = new Map<number, TSchema[]>();

  for (const code of errors) {
    const [status, message] = errorMap[code];

    const schema = specialErrors[code] ?? createErrorSchema(code, message);

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

export const routeGroups = {
  common: ["BAD_REQUEST", "INTERNAL_ERROR", "UNSUPPORTED_MEDIA_TYPE"],
  form: ["INVALID_JSON", "VALIDATION_ERROR"],
  auth: ["INVALID_TOKEN", "TOKEN_EXPIRED"],
  user: ["USER_NOT_FOUND", "EMAIL_ALREADY_EXISTS"],
  permission: ["FORBIDDEN"],
  company: ["COMPANY_NOT_FOUND"],
  member: ["MEMBER_NOT_FOUND"],
} as const;
