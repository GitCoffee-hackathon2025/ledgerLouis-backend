import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "../../../api/schemas/primitives/id.schema.js";

// primitives
const TagName = Type.String({ minLength: 1, maxLength: 50 });

// shared
const TagData = Type.Object({
  id: IdSchema,
  companyId: IdSchema,
  name: TagName,
});

// params
export const CompanyIdParam = Type.Object({
  companyId: IdSchema,
});
export type CompanyIdParamType = Static<typeof CompanyIdParam>;

export const TagIdParam = Type.Object({
  companyId: IdSchema,
  id: IdSchema,
});
export type TagIdParamType = Static<typeof TagIdParam>;

// bodies
export const CreateTagBody = Type.Object(
  { name: TagName },
  { additionalProperties: false },
);
export type CreateTagBodyType = Static<typeof CreateTagBody>;

export const UpdateTagBody = Type.Object(
  { name: TagName },
  { additionalProperties: false },
);
export type UpdateTagBodyType = Static<typeof UpdateTagBody>;

// route generics
export type GetTagRoute = { Params: TagIdParamType };
export type ListTagsRoute = { Params: CompanyIdParamType };
export type CreateTagRoute = {
  Params: CompanyIdParamType;
  Body: CreateTagBodyType;
};
export type UpdateTagRoute = { Params: TagIdParamType; Body: UpdateTagBodyType };
export type DeleteTagRoute = { Params: TagIdParamType };

// responses
export const TagResponse = TagData;
export const TagsListResponse = Type.Array(TagData);
