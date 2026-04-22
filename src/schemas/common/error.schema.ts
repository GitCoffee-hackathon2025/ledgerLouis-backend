import { Type } from "@sinclair/typebox";

export const ErrorResponse = Type.Object({
  statusCode: Type.Number(),
  message: Type.String(),
});
