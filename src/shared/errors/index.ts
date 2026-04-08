import { errorMap, type ErrorCode } from "./errorCodes";

type FieldError = { field: string; message: string };

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

// Erro para formulário
export class ValidationError extends AppError {
  fields: FieldError[];

  constructor(fields: FieldError[]) {
    super("INVALID_CREDENTIALS");
    this.fields = fields;
  }
}
