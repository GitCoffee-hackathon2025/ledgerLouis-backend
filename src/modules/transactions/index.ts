// import type { FastifyInstance } from "fastify";

// import { TransactionBody, TransactionResponse } from "./schema.js";
// import { buildTransactionModule } from "../transactions/module.js";
// import { buildTransactionRoutes } from "../transactions/routes.js";
// import { Type } from "@sinclair/typebox";
// export default async function (app: FastifyInstance) {
//   const routes = buildTransactionRoutes(buildTransactionModule(app));

//   app.post(
//     "/register",
//     {
//       schema: {
//         tags: ["transactions"],
//         summary: "Register transaction",
//         body: TransactionBody,
//         response: {
//           201: TransactionResponse,
//           400: { type: null },
//         },
//       },
//     },
//     routes.register,
//   );
//   app.get(
//     "/transactions/:id",
//     {
//       schema: {
//         tags: ["transactions"],
//         summary: "Get transaction by id",
//         response: {
//           200: TransactionResponse,
//           400: { type: null },
//         },
//       },
//     },
//     routes.getById,
//   );
//   app.put(
//     "/transactions/:id",
//     {
//       schema: {
//         tags: ["transactions"],
//         summary: "Update transaction",
//         body: TransactionBody,
//         response: {
//           200: TransactionResponse,
//           400: { type: null },
//         },
//       },
//     },
//     routes.update,
//   );
//   app.delete(
//     "/transactions/:id",
//     {
//       schema: {
//         tags: ["transactions"],
//         summary: "Delete transaction",
//         response: {
//           200: { type: "null" },
//           400: { type: null },
//         },
//       },
//     },
//     routes.delete,
//   );
// }
