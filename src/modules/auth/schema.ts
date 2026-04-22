import { Type } from "@sinclair/typebox";
import { JwtSchema, JwtPattern } from "../../schemas/primitives/jwt.schema";
import { ErrorResponse } from "../../schemas/common/error.schema";

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
