import type { FastifyInstance } from "fastify";
import { buildUserModule } from "./module.js";

import { userRouter } from "./routes/user.router.js";
import { profileImageRouter } from "./routes/profileImage.router.js";

export default async function (app: FastifyInstance) {
  const module = buildUserModule(app.db, app.storage);

  await app.register(userRouter(module.userService), {
    prefix: "/users",
  });

  await app.register(profileImageRouter(module.profileImageService), {
    prefix: "/users",
  });
}
