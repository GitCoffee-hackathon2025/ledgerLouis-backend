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

export const invitionErros = {
  INVITATION_EXPIRED: [410, "Invitation has expired."],
  INVITATION_NOT_FOUND: [404, "Invitation not found."],
  INVITATION_ALREADY_ACCEPTED: [409, "Invitation has already been accepted."],
  INVITATION_REVOKED: [410, "Invitation has been revoked."],
  INVITATION_EMAIL_MISMATCH: [
    403,
    "This invitation was sent to a different email address.",
  ],
} as const;
