export const authErrors = {
  INVALID_CREDENTIALS: [401, "Invalid credentials"],
  INVALID_TOKEN: [401, "Invalid token"],
  TOKEN_EXPIRED: [401, "Token expired"],
  TOKEN_NOT_FOUND: [401, "Token not found"],
  TOKEN_REUSE_DETECTED: [401, "Session compromised"],
  UNAUTHORIZED: [401, "Unauthorized"],
} as const;

export const verificationEmailErrors = {
  VERIFICATION_EMAIL_NOT_FOUND: [404, "Email verification not found"],
  VERIFICATION_NOT_FOUND: [404, "Verification token not found"],
  VERIFICATION_EXPIRED: [410, "Verification token has expired"],
  EMAIL_VERIFICATION_COOLDOWN: [
    429,
    "Please wait before requesting another verification email",
  ],
} as const;
