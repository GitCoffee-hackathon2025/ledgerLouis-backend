import { createCloudinaryStorage } from "./cloudinary.js";
import { createLocalStorage } from "./local.js";

export const providers = {
  cloudinary: createCloudinaryStorage,
  local: createLocalStorage,
};

export type StorageDriver = keyof typeof providers;
