import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "../../../api/schemas/primitives/id.schema.js";

// As respostas seguem o contrato já usado pelo dashboard de investimentos (campos em snake_case)
// e não são filtradas por schema; a entrada, sim, é toda validada aqui ou no service.

const NumberLike = Type.Union([Type.String({ maxLength: 40 }), Type.Number()]);

// params
export const TickerParam = Type.Object({
  ticker: Type.String({ minLength: 1, maxLength: 16 }),
});
export const GroupParam = Type.Object({
  kind: Type.Union([Type.Literal("sector"), Type.Literal("niche")]),
  slug: Type.String({ minLength: 1, maxLength: 100 }),
});
export const CategoryParam = Type.Object({
  category: Type.String({ minLength: 1, maxLength: 20 }),
});
export const IdParam = Type.Object({ id: IdSchema });
export const ChangeParam = Type.Object({
  id: IdSchema,
  verb: Type.Union([Type.Literal("apply"), Type.Literal("reject")]),
});

// querystring
export const AfterQuery = Type.Object({
  after: Type.Optional(Type.String({ maxLength: 26 })),
});

// bodies
export const ScreenContextBody = Type.Object(
  { path: Type.String() },
  { additionalProperties: true },
);
// Campos e regras do perfil ficam no service: as mesmas regras valem para as sugestões do Claude.
export const ProfileBody = Type.Record(Type.String(), Type.Unknown());
export const HoldingBody = Type.Object(
  {
    quantity: NumberLike,
    avg_price: Type.Optional(Type.Union([NumberLike, Type.Null()])),
  },
  { additionalProperties: false },
);
export const DecisionBody = Type.Object(
  {
    decision: Type.String({ maxLength: 20 }),
    adjusted_weight: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    comment: Type.Optional(Type.String({ maxLength: 2000 })),
  },
  { additionalProperties: false },
);
export const ChatBody = Type.Object(
  {
    message: Type.String({ minLength: 1, maxLength: 4000, pattern: "\\S" }),
    session_id: Type.Optional(Type.Union([Type.String({ maxLength: 36 }), Type.Null()])),
  },
  { additionalProperties: false },
);

// route generics
export type TickerRoute = { Params: Static<typeof TickerParam> };
export type GroupRoute = { Params: Static<typeof GroupParam> };
export type CategoryRoute = { Params: Static<typeof CategoryParam> };
export type IdRoute = { Params: Static<typeof IdParam> };
export type ChangeRoute = { Params: Static<typeof ChangeParam> };
export type ScreenCommandsRoute = { Querystring: Static<typeof AfterQuery> };
export type ScreenContextRoute = { Body: Static<typeof ScreenContextBody> };
export type ProfileRoute = { Body: Static<typeof ProfileBody> };
export type HoldingRoute = TickerRoute & { Body: Static<typeof HoldingBody> };
export type DecisionRoute = IdRoute & { Body: Static<typeof DecisionBody> };
export type ChatRoute = { Body: Static<typeof ChatBody> };
