import { errorMap, type ErrorCode } from "../definitions/map.js";
import type { ErrorPayloads } from "../definitions/payloads.js";

type ErrorArgs<T extends ErrorCode> = T extends keyof ErrorPayloads
  ? [options: ErrorPayloads[T]]
  : [];

export class AppError<T extends ErrorCode> extends Error {
  readonly statusCode: number;

  constructor(
    public code: T,
    ...args: ErrorArgs<T>
  ) {
    const [statusCode, message] = errorMap[code];

    super(message);

    this.statusCode = statusCode;

    if (args.length) Object.assign(this, args[0]);
  }
}
