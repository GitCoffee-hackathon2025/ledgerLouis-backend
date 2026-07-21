import { Type } from "@sinclair/typebox";

export const IdSchema = Type.String({ format: "ulid" });
