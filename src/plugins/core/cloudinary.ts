import fp from "fastify-plugin";
import { type FastifyInstance } from "fastify";
import { v2 as cloudinary } from "cloudinary";

export default fp(
  async function (app: FastifyInstance) {
    if (app.config.STORAGE_DRIVER !== "cloudinary") return; // TEMPORARIO - permite local

    cloudinary.config({
      cloud_name: app.config.CLOUDINARY_CLOUD_NAME,
      api_key: app.config.CLOUDINARY_API_KEY,
      api_secret: app.config.CLOUDINARY_API_SECRET,
    });

    app.decorate("cloudinary", cloudinary);
  },
  {
    name: "cloudinary",
    dependencies: ["env"],
  },
);
