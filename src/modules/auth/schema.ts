import { Type, type Static } from "@sinclair/typebox";

import { Email, Password } from "../../api/schemas/primitives/user.schema.js";
import {
  JwtSchema,
  JwtPattern,
} from "../../api/schemas/primitives/jwt.schema.js";

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

// query
export const LoginQuery = Type.Object(
  { token: Type.Optional(Type.String({ minLength: 1 })) },
  { additionalProperties: false },
);

export type LoginQueryType = Static<typeof LoginQuery>;

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

// email verification
export const EmailVerificationResendBody = Type.Object(
  {
    email: Email,
  },
  { additionalProperties: false },
);
export type EmailVerificationResendBodyType = Static<
  typeof EmailVerificationResendBody
>;

// route generics
export type LoginRoute = { Body: LoginBodyType; Querystring: LoginQueryType };
export type RefreshRoute = { Body: RefreshBodyType };
export type LogoutRoute = { Headers: AuthHeaderType };
export type LogoutAllRoute = { Headers: AuthHeaderType };

export type EmailVerificationResendRoute = {
  Body: EmailVerificationResendBodyType;
};
// responses
export const AuthResponse = Type.Object({
  accessToken: JwtSchema,
  refreshToken: JwtSchema,
});

export const EmailVerificationResponse = Type.Object({
  email: Email,
  expiresAt: Type.String({ format: "date-time" }),
  cooldown: Type.String({ format: "date-time" }),
});
