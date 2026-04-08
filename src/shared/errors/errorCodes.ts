export const errorMap = {
  INTERNAL_ERROR: {
    statusCode: 500,
    message: "Internal server error",
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    message: "Invalid credentials",
  },
  // TOKEN_EXPIRED: {
  //   statusCode: 401,
  //   message: "Token expired",
  // },
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
