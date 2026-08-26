import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "../../../api/schemas/primitives/id.schema.js";

// primitives
const EntryType = Type.Union([Type.Literal("debit"), Type.Literal("credit")]);
const Frequency = Type.Union([
  Type.Literal("weekly"),
  Type.Literal("monthly"),
  Type.Literal("yearly"),
]);
const Status = Type.Union([
  Type.Literal("active"),
  Type.Literal("paused"),
  Type.Literal("finished"),
]);
const Amount = Type.Number({ minimum: 0.01 });
const DateString = Type.String({ format: "date" });

// shared
const RecurringTransactionData = Type.Object({
  id: IdSchema,
  companyId: IdSchema,
  description: Type.Union([Type.String(), Type.Null()]),
  amount: Amount,
  entryType: EntryType,
  frequency: Frequency,
  intervalValue: Type.Union([Type.Number(), Type.Null()]),
  startDate: DateString,
  endDate: Type.Union([DateString, Type.Null()]),
  nextRunDate: DateString,
  lastRunDate: Type.Union([DateString, Type.Null()]),
  status: Status,
});

// params
export const CompanyIdParam = Type.Object({ companyId: IdSchema });
export type CompanyIdParamType = Static<typeof CompanyIdParam>;

export const RecurringIdParam = Type.Object({
  companyId: IdSchema,
  id: IdSchema,
});
export type RecurringIdParamType = Static<typeof RecurringIdParam>;

// bodies
export const CreateRecurringBody = Type.Object(
  {
    description: Type.Optional(Type.String()),
    amount: Amount,
    entryType: EntryType,
    frequency: Frequency,
    intervalValue: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    startDate: DateString,
    endDate: Type.Optional(DateString),
  },
  { additionalProperties: false },
);
export type CreateRecurringBodyType = Static<typeof CreateRecurringBody>;

export const UpdateRecurringBody = Type.Object(
  {
    description: Type.Optional(Type.String()),
    amount: Type.Optional(Amount),
    entryType: Type.Optional(EntryType),
    frequency: Type.Optional(Frequency),
    intervalValue: Type.Optional(Type.Integer({ minimum: 1 })),
    endDate: Type.Optional(DateString),
    status: Type.Optional(Status),
  },
  { additionalProperties: false },
);
export type UpdateRecurringBodyType = Static<typeof UpdateRecurringBody>;

// route generics
export type GetRecurringRoute = { Params: RecurringIdParamType };
export type ListRecurringRoute = { Params: CompanyIdParamType };
export type CreateRecurringRoute = {
  Params: CompanyIdParamType;
  Body: CreateRecurringBodyType;
};
export type UpdateRecurringRoute = {
  Params: RecurringIdParamType;
  Body: UpdateRecurringBodyType;
};
export type DeleteRecurringRoute = { Params: RecurringIdParamType };
export type RunRecurringRoute = { Params: RecurringIdParamType };

// responses
export const RecurringResponse = RecurringTransactionData;
export const RecurringListResponse = Type.Array(RecurringTransactionData);
export const RunRecurringResponse = Type.Object({
  id: IdSchema,
  created: Type.Number(),
  status: Status,
  nextRunDate: DateString,
});
