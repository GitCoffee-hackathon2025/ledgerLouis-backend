import { Type } from "@sinclair/typebox";

export const DateTime = Type.Transform(Type.String({ format: "date-time" }))
  .Decode((value) => new Date(value))
  .Encode((value) => value.toISOString());
