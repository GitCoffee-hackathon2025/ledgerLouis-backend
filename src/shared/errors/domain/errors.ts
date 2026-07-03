import { errorMap, type ErrorCode } from "../definitions/map.js";

export class AppError extends Error {
  statusCode: number;

  constructor(public code: ErrorCode) {
    const [statusCode, message] = errorMap[code];
    super(message);

    this.statusCode = statusCode;
  }
}
