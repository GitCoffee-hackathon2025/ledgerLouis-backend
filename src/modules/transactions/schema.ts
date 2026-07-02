import { type Static, Type} from "@sinclair/typebox";
import { IdSchema } from "../../schemas/primitives/id.schema.js";
import { Name, Email, Password } from "../../schemas/primitives/user.schema.js";

export const TransactionBody = Type.Object(
    {
        id: IdSchema,
        description: Type.String(),
        companyId: IdSchema,
        projectId: IdSchema,
    }
    
);
export const TransactionResponse = Type.Object({
    id: IdSchema,
    amount: Type.Number(),
    description: Type.String(),
    companyId: IdSchema,
    projectId: IdSchema,
});

export type TransactionBodyType = Static<typeof TransactionBody>;
export type TransactionResponse = Static<typeof TransactionResponse>;