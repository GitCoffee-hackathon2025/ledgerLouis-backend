// Importante: A pasta schemas é usada para tipagens globais

import { Type, type Static } from "@sinclair/typebox";

// Variável que declara a tipagem do .env
export const EnvSchema = Type.Object({
  PORT: Type.Number({ default: 3000 }),

  NODE_ENV: Type.Union(
    [
      Type.Literal("development"),
      Type.Literal("production"),
      Type.Literal("test"),
    ],
    { default: "development" },
  ),
});

export type Env = Static<typeof EnvSchema>;
