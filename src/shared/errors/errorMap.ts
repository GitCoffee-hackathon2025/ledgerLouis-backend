export const errorMap = {
  INTERNAL_ERROR: [500, "Internal server error"],
  INVALID_CREDENTIALS: [401, "Invalid credentials"],
  VALIDATION_ERROR: [400, "Invalid input"],
  KEY_NOT_FOUND: [500, "No signing key available"],
  TOKEN_NOT_FOUND: [401, "Token not found"],
  INVALID_TOKEN: [401, "Invalid token"],
  TOKEN_EXPIRED: [401, "Token expired"],
  TOKEN_REUSE_DETECTED: [401, "Session compromised"],
  UNAUTHORIZED: [401, "Unauthorized"],
  EMAIL_ALREADY_EXISTS: [409, "Email already in use"],
} as const;

export type ErrorCode = keyof typeof errorMap;
