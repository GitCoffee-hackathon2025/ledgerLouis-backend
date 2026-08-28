import { createEmailService } from "../../infrastructure/email/index.js";

export default async function () {
  return createEmailService(
    "smtp",
    {
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",

      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASSWORD!,
      },
    },
    {
      from: process.env.SMTP_FROM!,
      ...(process.env.SMTP_SENDER ? { sender: process.env.SMTP_SENDER } : {}),
      ...(process.env.SMTP_REPLY_TO
        ? { replyTo: process.env.SMTP_REPLY_TO }
        : {}),
    },
  );
}
