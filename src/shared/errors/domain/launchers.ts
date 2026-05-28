import { errorMap, type ErrorCode } from "../definitions/map.js";
import type { FieldErrorsType } from "../../../schemas/common/error.schema.js";

export class AppError extends Error {
  statusCode: number;

  constructor(public code: ErrorCode) {
    const [statusCode, message] = errorMap[code];
    super(message);

    this.statusCode = statusCode;
  }
}

// Erro para algum campo inválido
export class ValidationError extends AppError {
  constructor(public fields: FieldErrorsType) {
    super("VALIDATION_ERROR");
  }
}
