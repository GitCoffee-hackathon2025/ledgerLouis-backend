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

  // URL do servidor web
  WEB_URL: Type.String({ format: "uri" }),

  // Banco de dados
  DATABASE_URL: Type.String({ format: "uri" }),

  // Redis
  REDIS_URL: Type.String({ format: "uri" }),

  // Local de armazenamento dos arquivos
  STORAGE_DRIVER: Type.Union(
    [Type.Literal("local"), Type.Literal("cloudinary")],
    { default: "local" },
  ),

  CLOUDINARY_CLOUD_NAME: Type.Optional(Type.String()),
  CLOUDINARY_API_KEY: Type.Optional(Type.String()),
  CLOUDINARY_API_SECRET: Type.Optional(Type.String()),

  // Autenticação
  ENABLE_KEY_ROTATION: Type.Boolean({ default: true }),

  // Investimentos
  /// Token da brapi (cotações da B3). Sem ele a brapi só responde alguns tickers de teste
  BRAPI_TOKEN: Type.String({ default: "" }),
  /// Chave da API do Gemini (https://aistudio.google.com/apikey) para o chat. Vazio = chat desligado
  GEMINI_API_KEY: Type.Optional(Type.String()),
  GEMINI_CHAT_MODEL: Type.Optional(Type.String()),
});

export type Env = Static<typeof EnvSchema>;
