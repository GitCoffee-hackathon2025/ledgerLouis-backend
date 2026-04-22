import { Type } from "@sinclair/typebox";
import { errorMap } from "../../shared/errors/errorMap.js";

const ErrorCodeSchema = Type.Union(
  Object.keys(errorMap).map((code) => Type.Literal(code)) as any,
);

export const ErrorResponse = Type.Object({
  error: ErrorCodeSchema,
  message: Type.String(),
  fields: Type.Optional(Type.Record(Type.String(), Type.Array(Type.String()))),
});
