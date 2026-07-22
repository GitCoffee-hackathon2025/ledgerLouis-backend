export interface SaveFileParams {
  folder: string; // Pasta em que sera salvo o arquivo
  filename: string; // Nome do arquivo (escolhido pelo modulo uploader)
  file: NodeJS.ReadableStream; // Arquivo
}

export interface SavedFile {
  storageName: string; // Local que foi salvo
  location: string; // Path ou url que expoem o arquivo
}

export type StorageResource =
  | { type: "stream"; stream: NodeJS.ReadableStream }
  | { type: "redirect"; url: string };

export interface StorageProvider {
  readonly provider: string;

  save(params: SaveFileParams): Promise<SavedFile>;

  open(storageName: string): Promise<StorageResource>;

  delete(storageName: string): Promise<void>;
}
