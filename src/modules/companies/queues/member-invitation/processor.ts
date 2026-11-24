import type { Job } from "bullmq";

import type { DB } from "../../../../types/db.js";
import type { EmailService } from "../../../../types/email.js";

import type { MemberInvitationJob } from "./types/job.js";

import { createInviteRepository } from "../../repositories/invite.repository.js";
import { createCompanyRepository } from "../../repositories/company.repository.js";
import { createUserRepository } from "../../../users/repositories/user.repository.js";

export function createMemberInvitationProcessor({
  email,
  db,
}: {
  email: { sendTemplate: EmailService["sendTemplate"] };
  db: DB;
}) {
  const inviteRepo = createInviteRepository(db);
  const companyRepo = createCompanyRepository(db);
  const userRepo = createUserRepository(db);

  return async (job: Job<MemberInvitationJob>) => {
    const invite = await inviteRepo.findById(job.data.invitationId);

    if (!invite) throw new Error("FALHA ao encontrar convite!!!"); /// TEMP

    const company = await companyRepo.findById(invite.companyId);

    const recipient = await userRepo.findByEmail(invite.email);
    const actor = await userRepo.findById(invite.invitedBy);

    const text = {
      belonging: `d${company ? "a " + company.name : "e uma empresa"}`,
    };

    await email.sendTemplate({
      module: "companies",
      template: "member-invitation",
      message: {
        to: [invite.email],
        subject: `Você recebeu um convite ${text.belonging} da aplicação Ledger Louis`,
      },
      data: {
        title: `Convite para se tornar um ${invite.role} ${text.belonging}`,
        body: {
          companyName: company?.name ?? "",
          recipientName: recipient?.name ?? "",
          inviterName: actor?.name ?? "",
          invitaionUrl: job.data.invitationUrl,
        },
      },
    });
  };
}

/* 
export interface EmailMessage {
  to: Email[]; // Destinatários principais
  cc?: Email[]; // Destinatários em cópia
  bcc?: Email[]; // Destinatários em cópia oculta
  subject: string; // Assunto
  text?: string; // Corpo em texto puro
  attachments?: EmailAttachment[]; // Anexos (genérico)
}
*/
