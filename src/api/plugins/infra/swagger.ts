import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

export default fp(
  async function (app: FastifyInstance) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "ledgerLouis API",
          description:
            "Ledger é uma API REST para gerenciamento financeiro desenvolvida com Fastify e TypeScript, seguindo uma arquitetura modular orientada a domínio. A aplicação oferece autenticação baseada em JWT com rotação automática de chaves, controle de sessões, gerenciamento de empresas e membros com permissões, além de recursos para contas, transações, lançamentos contábeis, parcelamentos e demais operações financeiras. A documentação abaixo descreve todos os endpoints disponíveis, seus esquemas de entrada e saída, autenticação necessária e possíveis respostas de erro.",
          version: "1.0.0",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
      transform: ({ schema, route, url }) => {
        return {
          url,
          schema: {
            ...schema,
            ...(route.config?.auth === true
              ? { security: [{ bearerAuth: [] }] }
              : {}),
          },
        };
      },
    });

    if (app.config.NODE_ENV !== "production") {
      await app.register(swaggerUI, {
        routePrefix: "/docs",
      });

      app.get("/", async (req, res) => {
        return res.redirect("/docs/");
      });
    }
  },
  {
    name: "swagger",
    dependencies: ["env"],
    encapsulate: false,
  },
);
