import { AppError } from "../domain/errors.js";

export function handleFastifyError(error: any) {
  switch (error.code) {
    case "FST_ERR_CTP_INVALID_MEDIA_TYPE":
      return new AppError("UNSUPPORTED_MEDIA_TYPE");

    case "FST_ERR_CTP_EMPTY_JSON_BODY":
      return new AppError("INVALID_JSON");

    case "FST_ERR_CTP_INVALID_JSON_BODY":
      return new AppError("INVALID_JSON");

    case "FST_ERR_CTP_INVALID_CONTENT_LENGTH":
      return new AppError("BAD_REQUEST");

    case "FST_ERR_CTP_BODY_TOO_LARGE":
      return new AppError("PAYLOAD_TOO_LARGE");

    case "FST_REQ_FILE_TOO_LARGE":
      return new AppError("FILE_TOO_LARGE");

    default:
      return new AppError("INTERNAL_ERROR");
  }
}
