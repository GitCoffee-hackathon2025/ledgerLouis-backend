import { createTransport } from "nodemailer";

import type {
  EmailDefaults,
  EmailMessage,
  EmailSendResult,
  EmailTransporter,
} from "../types/contracts.js";

interface SMTPConfig {
  host: string; // Endereço do servidor SMTP (ex.: smtp-relay.brevo.com)
  port: number; // Porta utilizada para conexão com o servidor SMTP
  secure: boolean; // Define se a conexão inicia com TLS (true) ou STARTTLS (false)
  auth: {
    user: string; // Usuário utilizado para autenticação no servidor SMTP
    pass: string; // Senha ou chave SMTP utilizada na autenticação
  };
}

export function createSMTPTransporter(
  config: SMTPConfig,
  defaults: EmailDefaults,
): EmailTransporter {
  const transporter = createTransport({
    ...config,
    /* // Configuração para conexão pool - descomentar para habilitar
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    */
  });

  return {
    async send(emailMensage: EmailMessage): Promise<EmailSendResult> {
      const { accepted, rejected, messageId } = await transporter.sendMail({
        ...defaults,
        ...emailMensage,
      });
      return {
        accepted: accepted as string[],
        rejected: rejected as string[],
        messageId,
      };
    },

    async verify() {
      await transporter.verify();
    },

    close() {
      transporter.close();
    },
  };
}
