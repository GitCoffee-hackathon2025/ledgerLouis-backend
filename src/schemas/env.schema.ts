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
  ALLOWED_ORIGINS: Type.String({ default: "" }), // formato: "http://localhost, https:vercel.app/slaoque"

  // Banco de dados
  // DB_HOST: Type.String({ format: "hostname" }),
  // DB_PORT: Type.Number({ default: 3306 }),
  // DATABASE: Type.String({ default: "ledger" }),
  // DB_USER: Type.String(),
  // DB_PASS: Type.String(),
  DATABASE_URL: Type.String({ format: "uri" }),
  // Autenticação
  ENABLE_KEY_ROTATION: Type.Boolean({ default: true }),
});

export type Env = Static<typeof EnvSchema>;
