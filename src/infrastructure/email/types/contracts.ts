export type Email = `${string}@${string}.${string}`;

// Configurações padrão aplicadas a todos os e-mails enviados.
export interface EmailDefaults {
  from: string; // Remetente exibido ao destinatário
  sender?: string; // Remetente técnico (Sender)
  replyTo?: string; // Endereço utilizado para respostas
  headers?: Record<string, string>; // Cabeçalhos SMTP/HTTP personalizados
}

// Mensagem de e-mail independente do provedor.
export interface EmailMessage {
  to: Email[]; // Destinatários principais
  cc?: Email[]; // Destinatários em cópia
  bcc?: Email[]; // Destinatários em cópia oculta
  subject: string; // Assunto
  text?: string; // Corpo em texto puro
  html?: string; // Corpo em HTML
  attachments?: EmailAttachment[]; // Anexos (genérico)
}

// Anexo enviado no e-mail.
export interface EmailAttachment {
  filename: string; // Nome do arquivo
  content: Buffer | string; // Conteúdo do arquivo
  contentType?: string; // MIME Type
  cid?: string; // Content-ID (para imagens inline)
}

// Resultado do envio.
export interface EmailSendResult {
  accepted: string[]; // Destinatários que aceitaram o e-mail
  rejected: string[]; // Destinatários rejeitados
  messageId: string; // Identificador retornado pelo provedor
}

// Interface que qualquer transportador deve implementar.
export interface EmailTransporter {
  send(message: EmailMessage): Promise<EmailSendResult>; // Envia uma mensagem.

  verify(): Promise<void>; // Verifica se o provedor está acessível.

  close(): void | Promise<void>; // Encerra conexões abertas.
}
