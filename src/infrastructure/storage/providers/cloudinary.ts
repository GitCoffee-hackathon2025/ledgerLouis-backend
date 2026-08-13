import { v2 as Cloudinary, type UploadApiResponse } from "cloudinary";

import type {
  SaveFileParams,
  SavedFile,
  StorageResource,
  StorageProvider,
} from "../types/contracts.js";

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export function createCloudinaryStorage(
  config: CloudinaryConfig,
): StorageProvider {
  const cloudinary = Cloudinary;
  cloudinary.config(config);

  return {
    provider: "cloudinary",

    async save({ filename, folder, file }: SaveFileParams): Promise<SavedFile> {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: filename,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) return reject(error);

            if (!result)
              return reject(
                new Error("Cloudinary did not return upload result."),
              );

            resolve(result);
          },
        );

        file.pipe(upload);
      });

      return {
        storageName: result.public_id,
        location: result.secure_url,
      };
    },

    async open(storageName: string): Promise<StorageResource> {
      return {
        type: "redirect",
        url: cloudinary.url(storageName, { secure: true }),
      };
    },

    async delete(storageName: string) {
      await cloudinary.uploader.destroy(storageName);
    },
  };
}
