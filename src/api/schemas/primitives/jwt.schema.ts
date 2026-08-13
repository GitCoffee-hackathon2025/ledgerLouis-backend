import { Type } from "@sinclair/typebox";

export const JwtPattern = "[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+";

export const JwtSchema = Type.String({
  pattern: `^${JwtPattern}$`,
  minLength: 20,
});
