import { Type, type Static } from "@sinclair/typebox";

// 1. Schema base para os IDs (ULID)
export const IdSchema = Type.String({ format: "uuid" }); // ou apenas Type.String() se não usar format

// 2. Tipos de Conta permitidos
export const AccountTypeSchema = Type.Union([
  Type.Literal("asset"),
  Type.Literal("expense"),
  Type.Literal("revenue")
]);
export const createTransactionRouteSchema = {
  body: Type.Object({
    amount: Type.Number(),
    description: Type.String(),
    entryType: Type.Union([Type.Literal("debit"), Type.Literal("credit")]),
  }),


  params: Type.Object({
    companyId: Type.String(),
    id: Type.String(),
  }),
};

export const getAccountValueRoute = {
  params: Type.Object({
    companyId: Type.String(),
  }),
};
export const CompanyParam = Type.Object({
  companyId: Type.String(), // 👈 Esse cara só valida o ID da empresa!
});
export type GetAccountValueRoute = {
  Params: Static<typeof getAccountValueRoute.params>;
};
// 3. Schema de Criação (O que o Front-end envia no POST)
export const accountCreateSchema = Type.Object({
  companyId: IdSchema,
  name: Type.String({ minLength: 1 }),
  value: Type.String(), // Mantido como string por causa do numeric(15,2)
  type: AccountTypeSchema,
});
export type accountCreate = Static<typeof accountCreateSchema>;

// 4. Schema de Atualização (Campos opcionais para o PUT/PATCH)
export const accountUpdateSchema = Type.Partial(
  Type.Object({
    name: Type.String(),
    value: Type.String(),
    type: AccountTypeSchema,
  })
);
export type accountUpdate = Static<typeof accountUpdateSchema>;

// 5. Schema Completo da Conta (Como ela sai do Banco de Dados)
export const accountSchema = Type.Object({
  id: IdSchema,
  companyId: IdSchema,
  name: Type.String(),
  value: Type.String(),
  type: AccountTypeSchema,
  createdAt: Type.Any(), // Date vindo do Drizzle
  updatedAt: Type.Any(),
});
export type account = Static<typeof accountSchema>;

// 6. Schema específico para a sua rota getAccountValue
export const accountValueResponseSchema = Type.Object({
  value: Type.String(),
});
export type accountValueResponse = Static<typeof accountValueResponseSchema>;