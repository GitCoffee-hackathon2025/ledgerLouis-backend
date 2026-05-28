export const commonErrors = {
  BAD_REQUEST: [400, "Request error"],
  INTERNAL_ERROR: [500, "Internal server error"],
  VALIDATION_ERROR: [400, "Invalid input"],
} as const;
