import { Type, type Static } from "@sinclair/typebox";
import { IdSchema } from "../../../api/schemas/primitives/id.schema.js";
import { Email } from "../../../api/schemas/primitives/user.schema.js";

// primitives
const NameCompany = Type.String({ minLength: 3, maxLength: 150 });
const Cnpj = Type.String({ format: "cnpj" });
const Cep = Type.String({ pattern: "^\\d{8}$" });
const Phone = Type.String({ pattern: "^\\d{10,11}$" });

// shared
const CompanyData = Type.Object({
  id: IdSchema,
  name: NameCompany,
  cnpj: Cnpj,
  email: Type.Optional(Email),
  cep: Type.Optional(Cep),
  phone: Type.Optional(Phone),
  // createdAt: Type.String({ format: "date-time" }),
  // updatedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  // deletedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
});

// params
export const CompanyIdParam = Type.Object({
  companyId: IdSchema,
});
export type CompanyIdParamType = Static<typeof CompanyIdParam>;

// bodies
export const CreateBody = Type.Object(
  {
    name: NameCompany,
    cnpj: Cnpj,
    email: Type.Optional(Email),
    cep: Type.Optional(Cep),
    phone: Type.Optional(Phone),
  },
  { additionalProperties: false },
);
export type CreateBodyType = Static<typeof CreateBody>;

const UpdateBodyProperties = {
  name: NameCompany,
  email: Email,
  cep: Cep,
  phone: Phone,
} as const;

export function createUpdateBody<K extends keyof typeof UpdateBodyProperties>(
  ...keys: K[]
) {
  const properties = Object.fromEntries(
    keys.map((key) => [key, UpdateBodyProperties[key]]),
  ) as Pick<typeof UpdateBodyProperties, K>;

  return Type.Object(properties, {
    additionalProperties: false,
  });
}

export const UpdateBody = Type.Object(
  {
    name: NameCompany,
    email: Email,
    cep: Cep,
    phone: Phone,
  },
  { additionalProperties: false },
);
export type UpdateBodyType = Static<typeof UpdateBody>;

// route generics
export type GetCompanyRoute = { Params: CompanyIdParamType };

export type CreateCompanyRoute = { Body: CreateBodyType };

// export type UpdateCompanyRoute = { Params: IdParamType; Body: UpdateBodyType };
export type UpdateCompanyRoute<K extends keyof UpdateBodyType> = {
  Params: CompanyIdParamType;
  Body: Pick<UpdateBodyType, K>;
};

export type DeleteCompanyRoute = { Params: CompanyIdParamType };

// responses
export const CompanyResponse = CompanyData;

export const CompaniesListResponse = Type.Array(CompanyData);
