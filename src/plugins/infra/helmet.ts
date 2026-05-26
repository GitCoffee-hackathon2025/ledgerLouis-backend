// import fp from "fastify-plugin";
// import fastifyHelmet from "@fastify/helmet";
// import { type FastifyInstance } from "fastify";

// // Ver como funciona corretamente no futuro

// export default fp(
//   async function (app: FastifyInstance) {
//     await app.register(fastifyHelmet, {
//       global: true,

//       contentSecurityPolicy: false, // API não precisa disso

//       crossOriginResourcePolicy: { policy: "same-site" },

//       crossOriginOpenerPolicy: { policy: "same-origin" },

//       crossOriginEmbedderPolicy: false, // evita quebrar coisas como uploads / integrações

//       hsts: {
//         maxAge: 15552000, // 180 dias
//         includeSubDomains: true,
//         preload: true,
//       },

//       frameguard: {
//         action: "deny",
//       },

//       referrerPolicy: {
//         policy: "no-referrer",
//       },
//     });
//   },
//   {
//     name: "helmet",
//   },
// );
