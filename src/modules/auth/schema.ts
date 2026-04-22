import { Type } from "@sinclair/typebox";
import { JwtSchema, JwtPattern } from "../../schemas/primitives/jwt.schema.js";
import { ErrorResponse } from "../../schemas/common/error.schema.js";

// headers
export const AuthHeader = Type.Object(
  {
    authorization: Type.String({
      pattern: `^Bearer ${JwtPattern}$`,
    }),
  },
  { additionalProperties: true },
);

// bodies
export const RefreshBody = Type.Object(
  {
    refreshToken: JwtSchema,
  },
  { additionalProperties: false },
);

// responses
export const AuthResponse = Type.Object({
  accessToken: JwtSchema,
  refreshToken: JwtSchema,
});

export const EmptyResponse = Type.Null();

export { ErrorResponse };
