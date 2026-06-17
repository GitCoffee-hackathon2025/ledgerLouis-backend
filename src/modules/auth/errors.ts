export const authErrors = {
  INVALID_CREDENTIALS: [401, "Invalid credentials"],
  INVALID_TOKEN: [401, "Invalid token"],
  TOKEN_EXPIRED: [401, "Token expired"],
  TOKEN_NOT_FOUND: [401, "Token not found"],
  TOKEN_REUSE_DETECTED: [401, "Session compromised"],
  UNAUTHORIZED: [401, "Unauthorized"],
} as const;
