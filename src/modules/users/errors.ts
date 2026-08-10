export const userErrors = {
  USER_NOT_FOUND: [404, "User not found"],
  EMAIL_ALREADY_EXISTS: [409, "Email already in use"],
  FORBIDDEN: [403, "Insufficient permissions"],
  PROFILE_IMAGE_NOT_FOUND: [404, "Profile Image not found"],
} as const;
