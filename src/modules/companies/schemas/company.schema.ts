import { Type, type Static } from "@sinclair/typebox";
import { IdSchema } from "../../../schemas/primitives/id.schema.js";
import { AuthSchema } from "../../../schemas/common/auth.schema.js";

// primitives
const NameCompany = Type.String({ minLength: 3, maxLength: 150 });

const Cnpj = Type.String({ format: "cnpj" });

// shared
const CompanyData = Type.Object({
  id: IdSchema,
  name: NameCompany,
  cnpj: Cnpj,
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  deletedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
});

// params
export const IdParam = Type.Object({ id: IdSchema });
export type IdParamType = Static<typeof IdParam>;

// bodies
export const CreateBody = Type.Object(
  { name: NameCompany, cnpj: Cnpj },
  { additionalProperties: false },
);
export type CreateBodyType = Static<typeof CreateBody>;

export const UpdateBody = Type.Object(
  { name: NameCompany },
  { additionalProperties: false },
);
export type UpdateBodyType = Static<typeof UpdateBody>;

// route generics
export type GetCompanyRoute = { Params: IdParamType };

export type CreateCompanyRoute = { Body: CreateBodyType };

export type UpdateCompanyRoute = { Params: IdParamType; Body: UpdateBodyType };

export type DeleteCompanyRoute = { Params: IdParamType };

// responses
export const CompanyResponse = CompanyData;

export const CompaniesListResponse = Type.Array(CompanyData);

export { AuthSchema };
