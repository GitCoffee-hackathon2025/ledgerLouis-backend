import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "../../../schemas/primitives/id.schema.js";
// import { Name, Email, Password } from "../../../schemas/primitives/user.schema.js";

export const IdParam = Type.Object({ id: IdSchema });
export type IdParamType = Static<typeof IdParam>;
export const TransactionBody = Type.Object({
  id: IdSchema,
  amount: Type.Number(),
  description: Type.String(),
  companyId: IdSchema,
  projectId: IdSchema,
});

export const TransactionResponse = Type.Object({
  id: IdSchema,
  amount: Type.Number(),
  description: Type.String(),
  companyId: IdSchema,
  projectId: IdSchema,
});

export const createTransactionBody = Type.Object({
  amount: Type.Number(),
  description: Type.String(),
  companyId: IdSchema,
  projectId: IdSchema,
});
export const updateTransactionBody = Type.Object({
  id: IdSchema,
  amount: Type.Number(),
  description: Type.String(),
  companyId: IdSchema,
  projectId: IdSchema,
});
export const ListTransactionResponse = Type.Array(TransactionResponse);

export type createTransactionBodyType = Static<typeof createTransactionBody>;
export type updateTransactionBodyType = Static<typeof updateTransactionBody>;

export type GetTransactionRoute = { Params: IdParamType };
export type CreateTransactionRoute = { Body: createTransactionBodyType };
export type UpdateTransactionRoute = {
  Params: IdParamType;
  Body: updateTransactionBodyType;
};
export type DeleteTransactionRoute = { Params: IdParamType };

export type TransactionBodyType = Static<typeof TransactionBody>;
export type TransactionResponse = Static<typeof TransactionResponse>;
