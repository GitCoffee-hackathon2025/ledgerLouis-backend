import { errorMap, type ErrorCode } from "./errorMap.js";
import type { FieldErrorsType } from "../../schemas/common/error.schema.js";

export class AppError extends Error {
  statusCode: number;

  constructor(
    public code: ErrorCode,
    customMessage?: string,
  ) {
    const [statusCode, message] = errorMap[code];

    super(customMessage ?? message);

    this.statusCode = statusCode;
  }
}

// Erro para algum campo inválido
export class ValidationError extends AppError {
  constructor(public fields: FieldErrorsType) {
    super("VALIDATION_ERROR");
  }
}
