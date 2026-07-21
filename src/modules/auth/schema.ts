import { Type, type Static } from "@sinclair/typebox";
import { Email, Password } from "../../api/schemas/primitives/user.schema.js";
import { JwtSchema, JwtPattern } from "../../api/schemas/primitives/jwt.schema.js";

// headers
export const AuthHeader = Type.Object(
  {
    authorization: Type.String({
      pattern: `^Bearer ${JwtPattern}$`,
    }),
  },
  { additionalProperties: true },
);
export type AuthHeaderType = Static<typeof AuthHeader>;

// bodies
export const LoginBody = Type.Object(
  {
    email: Email,
    password: Password,
  },
  { additionalProperties: false },
);
export type LoginBodyType = Static<typeof LoginBody>;

export const RefreshBody = Type.Object(
  {
    refreshToken: JwtSchema,
  },
  { additionalProperties: false },
);
export type RefreshBodyType = Static<typeof RefreshBody>;

// route generics
export type LoginRoute = { Body: LoginBodyType };
export type RefreshRoute = { Body: RefreshBodyType };
export type LogoutRoute = { Headers: AuthHeaderType };
export type LogoutAllRoute = { Headers: AuthHeaderType };

// responses
export const AuthResponse = Type.Object({
  accessToken: JwtSchema,
  refreshToken: JwtSchema,
});
