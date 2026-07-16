import { AppError } from "../domain/errors.js";

export function handleFastifyError(error: any) {
  switch (error.code) {
    case "FST_ERR_CTP_INVALID_MEDIA_TYPE":
      return new AppError("UNSUPPORTED_MEDIA_TYPE");

    case "FST_ERR_CTP_EMPTY_JSON_BODY":
      return new AppError("INVALID_JSON");

    case "FST_ERR_CTP_INVALID_JSON_BODY":
      return new AppError("INVALID_JSON");

    case "FST_ERR_VALIDATION":
      return new AppError("INVALID_JSON");

    default:
      return new AppError("BAD_REQUEST");
  }
}
