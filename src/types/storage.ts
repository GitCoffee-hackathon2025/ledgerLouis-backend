import type { StorageProvider } from "../modules/uploader/storageProvider.js";
import type { v2 } from "cloudinary";

export type Storage = StorageProvider;
export type Cloudinary = typeof v2;
