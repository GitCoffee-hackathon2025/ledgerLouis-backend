export const errorMap = {
  INTERNAL_ERROR: {
    statusCode: 500,
    message: "Internal server error",
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    message: "Invalid credentials",
  },
  VALIDATION_ERROR: {
    statusCode: 400,
    message: "Invalid input",
  },
  KEY_NOT_FOUND: {
    statusCode: 500,
    message: "No signing key available",
  },
  KEY_EXPIRED: {
    statusCode: 500,
    message: "Signing key expired",
  },
  TOKEN_NOT_FOUND: {
    statusCode: 401,
    message: "Token not found",
  },
  INVALID_TOKEN: {
    statusCode: 401,
    message: "Invalid token",
  },
  TOKEN_EXPIRED: {
    statusCode: 401,
    message: "Token expired",
  },
  TOKEN_REUSE_DETECTED: {
    statusCode: 401,
    message: "Refresh token reuse detected. Session has been compromised",
  },
  UNAUTHORIZED: {
    statusCode: 401,
    message: "Unauthorized",
  },
  EMAIL_ALREADY_EXISTS: {
    statusCode: 409,
    message: "Email already in use",
  },
  // FORBIDDEN: {
  //   statusCode: 403,
  //   message: "Forbidden",
  // },
  // USER_NOT_FOUND: {
  //   statusCode: 404,
  //   message: "User not found",
  // },
} as const;

export type ErrorCode = keyof typeof errorMap;
