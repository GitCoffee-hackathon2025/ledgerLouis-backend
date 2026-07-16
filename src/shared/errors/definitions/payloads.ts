import { Type, type Static } from "@sinclair/typebox";

export const errorPayloadSchemas = {
  VALIDATION_ERROR: Type.Object({
    fields: Type.Record(Type.String(), Type.Array(Type.String())),
  }),

  RATE_LIMIT_EXCEEDED: Type.Object({
    retryAfter: Type.Number(),
  }),

  // TOKEN_EXPIRED: Type.Object({
  //   expiredAt: Type.String({
  //     format: "date-time",
  //   }),
  // }),
} as const;

export type ErrorPayloads = {
  [K in keyof typeof errorPayloadSchemas]: Static<
    (typeof errorPayloadSchemas)[K]
  >;
};
