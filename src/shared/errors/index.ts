import { errorMap, type ErrorCode } from "./errorCodes";

type FieldErrors = Record<string, string[]>;

// Erro básico
export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;

  constructor(code: ErrorCode, customMessage?: string) {
    const config = errorMap[code];
    super(customMessage ?? config.message);
    this.code = code;
    this.statusCode = config.statusCode;
  }
}

// Erro para algum campo inválido
export class ValidationError extends AppError {
  fields: FieldErrors;

  constructor(fields: FieldErrors) {
    super("VALIDATION_ERROR");
    this.fields = fields;
  }
}
