import { Type,type Static} from "@sinclair/typebox";
import { IdSchema } from "../../schemas/primitives/id.schema.js";
import { Name, Email, Password } from "../../schemas/primitives/user.schema.js";
import { ErrorResponse } from "../../schemas/common/error.schema.js";


// bodies
export const RegisterBody = Type.Object(
  {
    name: Name,
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

export type RegisterBodyType = Static<typeof RegisterBody>;
export type UserResponseType = Static<typeof UserResponse>;

export { ErrorResponse };
