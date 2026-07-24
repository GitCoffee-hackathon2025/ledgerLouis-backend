import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import { CloudinaryStorageProvider } from "../../../modules/uploader/cloudinaryStorage.js";
import { LocalStorageProvider } from "../../../modules/uploader/localStorage.js";

import { createStorageService } from "../../../infrastructure/storage/index.js";
import { fromRoot } from "../../../config/paths.js";

export default fp(
  async function (app: FastifyInstance) {
    // const storage =
    //   app.config.STORAGE_DRIVER === "cloudinary"
    //     ? new CloudinaryStorageProvider(app.cloudinary)
    //     : new LocalStorageProvider();

    // app.decorate("storage", storage);

    if (app.config.STORAGE_DRIVER === "cloudinary") {
      app.decorate("storage", new CloudinaryStorageProvider(app.cloudinary));
      return;
    }

    app.decorate("storage", new LocalStorageProvider());
  },
  {
    name: "storage",
    dependencies: ["env", "cloudinary"],
  },
);

async function teste(app: FastifyInstance) {
  let storage: ReturnType<typeof createStorageService>;
  const driver = app.config.STORAGE_DRIVER;

  switch (driver) {
    case "local":
      storage = createStorageService(driver, {
        root: fromRoot("uploads"),
      });

      break;
    case "cloudinary":
      storage = createStorageService(driver, {
        cloud_name: app.config.CLOUDINARY_CLOUD_NAME,
        api_key: app.config.CLOUDINARY_API_KEY,
        api_secret: app.config.CLOUDINARY_API_SECRET,
      });

      break;
    default:
      throw new Error(`Unknown storage provider "${driver}".`);
  }

  // app.decorate("storage", storage);
}
