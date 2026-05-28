import { Type, type Static } from "@sinclair/typebox";

export const FieldErrorsSchema = Type.Record(
  Type.String(),
  Type.Array(Type.String()),
);
export type FieldErrorsType = Static<typeof FieldErrorsSchema>;
