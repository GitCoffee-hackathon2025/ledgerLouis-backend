  export interface SaveFileParams {
    filename: string;
    folder: "images" | "documents";
    file: NodeJS.ReadableStream;
  }

  export interface SavedFile {
    storageName: string;
    path: string;
  }

  export interface StorageProvider {
    readonly provider: "local" | "cloudinary";
    save(params: SaveFileParams): Promise<SavedFile>;
    delete(path: string): Promise<void>;
  }
