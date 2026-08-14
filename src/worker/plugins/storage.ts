import {
  createStorageService,
  providers,
  type StorageDriver,
  type StorageProvider,
} from "../../infrastructure/storage/index.js";

import { fromRoot } from "../../config/paths.js";

export function createStorage() {
  const storages: Partial<Record<StorageDriver, StorageProvider>> = {};

  // Local
  if (providers.includes("local"))
    storages.local = createStorageService("local", {
      root: fromRoot("uploads"),
    });

  // Cloudinary
  // if (
  //   providers.includes("cloudinary") &&
  //   process.env.CLOUDINARY_CLOUD_NAME &&
  //   process.env.CLOUDINARY_API_KEY &&
  //   process.env.CLOUDINARY_API_SECRET
  // )
  //   storages.cloudinary = createStorageService("cloudinary", {
  //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  //     api_key: process.env.CLOUDINARY_API_KEY,
  //     api_secret: process.env.CLOUDINARY_API_SECRET,
  //   });

  return storages as Record<StorageDriver, StorageProvider>;
}
