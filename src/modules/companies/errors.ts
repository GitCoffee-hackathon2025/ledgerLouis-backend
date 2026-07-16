export const companyErrors = {
  COMPANY_NOT_FOUND: [404, "Company not found"],
  CNPJ_ALREADY_EXISTS: [409, "CNPJ already in use"],
  PHONE_ALREADY_EXISTS: [409, "Phone already in use"],
} as const;

export const memberErrors = {
  MEMBER_NOT_FOUND: [404, "Member not found"],
  MEMBER_ALREADY_EXISTS: [409, "User is already a company member"],
  CANNOT_REMOVE_LAST_OWNER: [409, "Cannot remove the last owner"],
  CANNOT_CHANGE_OWN_ROLE: [403, "You cannot change your own role"],
} as const;
