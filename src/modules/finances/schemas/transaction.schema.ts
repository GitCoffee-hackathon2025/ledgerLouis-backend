import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "../../../schemas/primitives/id.schema.js";
// import { Name, Email, Password } from "../../../schemas/primitives/user.schema.js";

export const IdParam = Type.Object({ id: IdSchema });
export type IdParamType = Static<typeof IdParam>;
export const TransactionLedgerBody = Type.Object({

  amount: Type.Number(),
  description: Type.String(),
  entryType: Type.Union([
  Type.Literal("debit"),
  Type.Literal("credit"),
]),
  companyId: IdSchema,
  projectId: Type.Optional(IdSchema),
});
export const TransactionResponse = Type.Object({
   id: IdSchema,
  amount: Type.Number(),
  description: Type.String(),
  entryType: Type.Union([
  Type.Literal("debit"),
  Type.Literal("credit"),
]),
  companyId: IdSchema,
  projectId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const createTransactionBody = Type.Object({
  amount: Type.Number(),
  description: Type.String(),
  entryType: Type.Union([
  Type.Literal("debit"),
  Type.Literal("credit"),
]),
  projectId: Type.Optional(IdSchema),
});
export const updateTransactionBody = Type.Object({
    id: IdSchema,
  amount: Type.Number(),
  description: Type.String(),
  entryType: Type.Union([
  Type.Literal("debit"),
  Type.Literal("credit"),
]),
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

export type TransactionLedgerBodyType = Static<typeof TransactionLedgerBody>;
export type TransactionResponse = Static<typeof TransactionResponse>;
