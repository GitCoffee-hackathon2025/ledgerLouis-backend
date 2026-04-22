import { Type } from "@sinclair/typebox";
import { IdSchema } from "../../schemas/primitives/id.schema";
import { ErrorResponse } from "../../schemas/common/error.schema";

// primitives locais
export const Email = Type.String({ format: "email" });
export const Password = Type.String({
  minLength: 8,
  maxLength: 72,
  pattern: "^(?=.*[A-Za-z])(?=.*\\d).+$",
});
export const Name = Type.String({ minLength: 3, maxLength: 100 });

// bodies
export const RegisterBody = Type.Object(
  {
    name: Name,
    email: Email,
    password: Password,
  },
  { additionalProperties: false },
);

export const LoginBody = Type.Object(
  {
    email: Email,
    password: Password,
  },
  { additionalProperties: false },
);

// responses
export const UserResponse = Type.Object({
  id: IdSchema,
  name: Name,
  email: Email,
});

export { ErrorResponse };
