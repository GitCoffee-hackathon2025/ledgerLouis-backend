// export const errorMap = {
//   BAD_REQUEST: [400, "Request error"],
//   COMPANY_NOT_FOUND: [404, "Company not found"],
//   USER_NOT_FOUND: [404, "User not found"],
//   CNPJ_ALREADY_EXISTS: [409, "CNPJ already in use"],
//   EMAIL_ALREADY_EXISTS: [409, "Email already in use"],
//   INVALID_CREDENTIALS: [401, "Invalid credentials"],
//   INVALID_JSON: [400, "Malformed JSON body"],
//   INVALID_TOKEN: [401, "Invalid token"],
//   INTERNAL_ERROR: [500, "Internal server error"],
//   UNAUTHORIZED: [401, "Unauthorized"],
//   UNSUPPORTED_MEDIA_TYPE: [415, "Content-Type must be application/json"],
//   VALIDATION_ERROR: [400, "Invalid input"],
//   TOKEN_EXPIRED: [401, "Token expired"],
//   TOKEN_NOT_FOUND: [401, "Token not found"],
//   TOKEN_REUSE_DETECTED: [401, "Session compromised"],
//   MEMBER_ALREADY_EXISTS: [409, "User is already a company member"],
//   MEMBER_NOT_FOUND: [404, "Member not found"],
//   FORBIDDEN: [403, "Insufficient permissions"],
//   CANNOT_REMOVE_LAST_OWNER: [409, "Cannot remove the last owner"],
//   CANNOT_CHANGE_OWN_ROLE: [403, "You cannot change your own role"],
// } as const;

// Erros do próprio sistema
import { commonErrors } from "./common/common.errors.js";
import { httpErrors } from "./common/http.errors.js";

// Erros dos modulos

// Centralizador de erros
type ErrorDefinition = readonly [status: number, message: string];

type ErrorBranch = Record<string, ErrorDefinition>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

function generateErrorMap<const T extends readonly ErrorBranch[]>(
  ...branches: T
): UnionToIntersection<T[number]> {
  return Object.assign({}, ...branches);
}

// Variável mestre
export const errorMap = generateErrorMap(commonErrors, httpErrors);
export type ErrorCode = keyof typeof errorMap;

/* 
// modules/auth/errors.ts
export const authErrors = {
  INVALID_CREDENTIALS: [401, "Invalid credentials"],
  INVALID_TOKEN: [401, "Invalid token"],
  TOKEN_EXPIRED: [401, "Token expired"],
  TOKEN_NOT_FOUND: [401, "Token not found"],
  TOKEN_REUSE_DETECTED: [401, "Session compromised"],
  KEY_NOT_FOUND: [500, "No signing key available"],
} as const;

// modules/users/errors.ts
export const userErrors = {
  USER_NOT_FOUND: [404, "User not found"],
  EMAIL_ALREADY_EXISTS: [409, "Email already in use"],
} as const;

// modules/companies/errors.ts
export const companyErrors = {
  COMPANY_NOT_FOUND: [404, "Company not found"],
  CNPJ_ALREADY_EXISTS: [409, "CNPJ already in use"],

  MEMBER_ALREADY_EXISTS: [
    409,
    "User is already a company member",
  ],

  MEMBER_NOT_FOUND: [404, "Member not found"],

  CANNOT_REMOVE_LAST_OWNER: [
    409,
    "Cannot remove the last owner",
  ],

  CANNOT_CHANGE_OWN_ROLE: [
    403,
    "You cannot change your own role",
  ],
} as const;
*/
