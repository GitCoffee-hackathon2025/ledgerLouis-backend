import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import { createStorageService } from "../../../infrastructure/storage/index.js";
import { fromRoot } from "../../../config/paths.js";

export default fp(
  async function (app: FastifyInstance) {
    let storage: ReturnType<typeof createStorageService> | undefined;
    const driver = app.config.STORAGE_DRIVER;

    switch (driver) {
      case "local":
        storage = createStorageService(driver, {
          root: fromRoot("uploads"),
        });

        break;
      case "cloudinary":
        if (
          !app.config.CLOUDINARY_CLOUD_NAME ||
          !app.config.CLOUDINARY_API_KEY ||
          !app.config.CLOUDINARY_API_SECRET
        )
          throw new Error("Cloudinary configuration is missing");

        storage = createStorageService(driver, {
          cloud_name: app.config.CLOUDINARY_CLOUD_NAME,
          api_key: app.config.CLOUDINARY_API_KEY,
          api_secret: app.config.CLOUDINARY_API_SECRET,
        });

        break;
      default:
        throw new Error(`Unknown storage provider "${driver}".`);
    }

    app.decorate("storage", storage);
  },
  {
    name: "storage",
    dependencies: ["env", "multipart"],
  },
);
