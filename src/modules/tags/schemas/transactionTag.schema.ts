import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "../../../api/schemas/primitives/id.schema.js";

// params
export const TransactionParam = Type.Object({
  companyId: IdSchema,
  transactionId: IdSchema,
});
export type TransactionParamType = Static<typeof TransactionParam>;

export const TransactionTagParam = Type.Object({
  companyId: IdSchema,
  transactionId: IdSchema,
  tagId: IdSchema,
});
export type TransactionTagParamType = Static<typeof TransactionTagParam>;

// bodies
export const AttachTagBody = Type.Object(
  { tagId: IdSchema },
  { additionalProperties: false },
);
export type AttachTagBodyType = Static<typeof AttachTagBody>;

// route generics
export type ListTransactionTagsRoute = { Params: TransactionParamType };
export type AttachTagRoute = {
  Params: TransactionParamType;
  Body: AttachTagBodyType;
};
export type DetachTagRoute = { Params: TransactionTagParamType };

// responses
export const TransactionTagLinkResponse = Type.Object({
  id: IdSchema,
  transactionId: IdSchema,
  tagId: IdSchema,
});
