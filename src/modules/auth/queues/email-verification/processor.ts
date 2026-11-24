import type { Job } from "bullmq";

import type { DB } from "../../../../types/db.js";
import type { EmailService } from "../../../../types/email.js";

import type { EmailVerificationJob } from "./types/job.js";

import { createUserRepository } from "../../../users/repositories/user.repository.js";

export function createEmailVerificationProcessor({
  email,
  db,
}: {
  email: { sendTemplate: EmailService["sendTemplate"] };
  db: DB;
}) {
  const userRepo = createUserRepository(db);

  return async (job: Job<EmailVerificationJob>) => {
    const user = await userRepo.findById(job.data.userId);

    if (!user) throw new Error("FALHA ao encontrar usuário!!!"); // TEMP

    await email.sendTemplate({
      module: "auth",
      template: "email-verification",
      message: {
        to: [user.email],
        subject: "Verifique seu endereço de email no Ledger Louis",
      },
      data: {
        title: "Verificação de email",
        body: {
          recipientName: user.name,
          verificationUrl: job.data.verificationUrl,
        },
      },
    });
  };
}
