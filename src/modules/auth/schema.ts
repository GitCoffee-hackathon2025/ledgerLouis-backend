import { Type } from "@sinclair/typebox";
import { Email, Password } from "../../schemas/primitives/user.schema.js";
import { JwtSchema, JwtPattern } from "../../schemas/primitives/jwt.schema.js";

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
export const LoginBody = Type.Object(
  {
    email: Email,
    password: Password,
  },
  { additionalProperties: false },
);

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
