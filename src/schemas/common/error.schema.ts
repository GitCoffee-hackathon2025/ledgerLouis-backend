// import { Type } from "@sinclair/typebox";
// import { errorMap } from "../../shared/errors/errorMap.js";

const ErrorCodeSchema = Type.Union(
  Object.keys(errorMap).map((code) => Type.Literal(code)) as any,
);

export const ErrorResponse = Type.Object({
  error: ErrorCodeSchema,
  message: Type.String(),
  fields: Type.Optional(Type.Record(Type.String(), Type.Array(Type.String()))),
});

/// novo

import { Type, type Static } from "@sinclair/typebox";
import { errorMap, type ErrorCode } from "../../shared/errors/errorMap.js";


export const FieldErrorsSchema = Type.Record(
  Type.String(),
  Type.Array(Type.String()),
);

export type FieldErrorsType = Static<typeof FieldErrorsSchema>;

export function createErrorSchema<const T extends ErrorCode>(code: T) {
  const [, message] = errorMap[code];

  return Type.Object({
    error: Type.Literal(code),
    message: Type.Literal(message),
    fields: Type.Optional(
      Type.Record(Type.String(), Type.Array(Type.String())),
    ),
  });
}
