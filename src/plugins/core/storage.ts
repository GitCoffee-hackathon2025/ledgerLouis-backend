// src/plugins/core/storage.ts
import fp from "fastify-plugin";

import { CloudinaryStorageProvider } from "../../modules/uploader/cloudinaryStorage.js";
import { LocalStorageProvider } from "../../modules/uploader/localStorage.js";

export default fp(
  async function (app) {
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
