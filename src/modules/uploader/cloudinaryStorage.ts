import { v2 as Cloudinary, type UploadApiResponse } from "cloudinary";

import type {
  StorageProvider,
  SaveFileParams,
  SavedFile,
} from "./storageProvider.js";

export class CloudinaryStorageProvider implements StorageProvider {
  constructor(private readonly cloudinary: typeof Cloudinary) {}

  readonly provider = "cloudinary" as const;

  async save({ filename, folder, file }: SaveFileParams): Promise<SavedFile> {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error("Cloudinary did not return an upload result."));
            return;
          }

          resolve(result);
        },
      );

      file.pipe(upload);
    });

    return {
      storageName: result.public_id,
      location: result.secure_url,
    };
  }

  async delete(storageName: string): Promise<void> {
    await this.cloudinary.uploader.destroy(storageName);
  }
}
