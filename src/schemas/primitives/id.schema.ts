import { Type } from "@sinclair/typebox";

export const IdSchema = Type.String({
  pattern: "^[0-9A-HJKMNP-TV-Z]{26}$",
});
