import { Type, type Static }
  from "@sinclair/typebox";
import { ErrorResponse } from "../../schemas/common/error.schema.js";

export const FileResponse = Type.Object({
  id: Type.String(),
  originalName: Type.String(),
  storageName: Type.String(),
  mimeType: Type.String(),
  provider: Type.String(),
  path: Type.String(),
  size: Type.Number(),
  createdAt: Type.String({
    format: "date-time",
  }),
});

export type FileResponseType =
  Static<typeof FileResponse>;

export { ErrorResponse };