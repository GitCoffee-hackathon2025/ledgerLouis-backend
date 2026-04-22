import { errorMap, type ErrorCode } from "./errorMap.js";

type FieldErrors = Record<string, string[]>;

export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;

  constructor(code: ErrorCode, customMessage?: string) {
    const [statusCode, message] = errorMap[code];

    super(customMessage ?? message);

    this.code = code;
    this.statusCode = statusCode;
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
