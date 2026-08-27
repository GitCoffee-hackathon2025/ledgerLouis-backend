import type { createEmailService } from "../infrastructure/email/index.js";

export type EmailService = Awaited<ReturnType<typeof createEmailService>>;
