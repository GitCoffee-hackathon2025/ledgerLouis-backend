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
  // formato (sem "/" no final): "http://localhost, https:vercel.app"
  ALLOWED_ORIGINS: Type.String({ default: "" }), 

  // Banco de dados
  DATABASE_URL: Type.String({ format: "uri" }),

  // Cloudinary
  STORAGE_DRIVER: Type.Literal("cloudinary"),

  CLOUDINARY_CLOUD_NAME: Type.String(),
  CLOUDINARY_API_KEY: Type.String(),
  CLOUDINARY_API_SECRET: Type.String(),

  // Autenticação
  ENABLE_KEY_ROTATION: Type.Boolean({ default: true }),
});

export type Env = Static<typeof EnvSchema>;
