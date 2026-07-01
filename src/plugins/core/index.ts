import { CloudinaryStorageProvider } from "../../modules/uploader/cloudinaryStorage.js";
import { LocalStorageProvider } from "../../modules/uploader/localStorage.js";

export const storageProvider =
  process.env.STORAGE_DRIVER === "cloudinary"
    ? new CloudinaryStorageProvider()
    : new LocalStorageProvider();