import { createSMTPTransporter } from "./smtp.provider.js";

export const providers = {
  smtp: createSMTPTransporter,
};

export type EmailProvider = keyof typeof providers;
