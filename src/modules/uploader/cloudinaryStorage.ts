import { cloudinary } from "../../plugins/core/cloudinary.js";

import type {
  StorageProvider,
  SaveFileParams,
  SavedFile,
} from "./storageProvider.js";

export class CloudinaryStorageProvider
  implements StorageProvider
{
  readonly provider = "cloudinary" as const;

  async save({
    filename,
    folder,
    file,
  }: SaveFileParams): Promise<SavedFile> {
    const result = await new Promise<any>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
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

          resolve(result);
        }
      );

      file.pipe(upload);
    });

    return {
      storageName: result.public_id,
      path: result.secure_url,
    };
  }

  async delete(storageName: string): Promise<void> {
    await cloudinary.uploader.destroy(storageName);
  }
}