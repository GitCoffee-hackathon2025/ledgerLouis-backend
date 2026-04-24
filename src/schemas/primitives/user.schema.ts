import { Type } from "@sinclair/typebox";

export const Name = Type.String({ minLength: 3, maxLength: 100 });
export const Email = Type.String({ format: "email" });
export const Password = Type.String({
  minLength: 8,
  maxLength: 72,
  pattern: "^(?=.*[A-Za-z])(?=.*\\d).+$",
});