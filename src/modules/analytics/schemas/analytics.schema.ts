import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "../../../api/schemas/primitives/id.schema.js";

// params / querystring
export const CompanyIdParam = Type.Object({
  companyId: IdSchema,
});
export type CompanyIdParamType = Static<typeof CompanyIdParam>;

export const ExpenseStatsQuery = Type.Object({
  tagId: Type.Optional(IdSchema),
});
export type ExpenseStatsQueryType = Static<typeof ExpenseStatsQuery>;

// shared pieces
const MonthlyPoint = Type.Object({
  period: Type.String(),
  total: Type.Number(),
});

const ExpenseStatsFields = {
  months: Type.Array(MonthlyPoint),
  count: Type.Number(),
  mean: Type.Number(),
  variance: Type.Number(),
  standardDeviation: Type.Number(),
  forecastNextMonth: Type.Union([Type.Number(), Type.Null()]),
};

// responses
export const ExpenseStatsResponse = Type.Object({
  tagId: Type.Union([IdSchema, Type.Null()]),
  tagName: Type.Union([Type.String(), Type.Null()]),
  ...ExpenseStatsFields,
});

export const ExpenseStatsByTagResponse = Type.Array(
  Type.Object({
    tagId: IdSchema,
    tagName: Type.String(),
    ...ExpenseStatsFields,
  }),
);

// route generics
export type GetExpenseStatsRoute = {
  Params: CompanyIdParamType;
  Querystring: ExpenseStatsQueryType;
};

export type GetExpenseStatsByTagRoute = { Params: CompanyIdParamType };
