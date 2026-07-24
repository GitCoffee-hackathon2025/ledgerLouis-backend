/* 

Arquivo responsável por gerenciar os paths dos arquivos/pastas

*/

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SOURCE = join(__dirname, "..");
export const ROOT = join(SOURCE, "..");

/** Monta um path de pasta personalizado até algum arquivo/pasta
 * @param import.meta.url
 */
export function fromHere(metaUrl: string, ...segments: string[]) {
  return join(dirname(fileURLToPath(metaUrl)), ...segments);
}

/** Monta um path do SOURCE até algum arquivo/pasta
 */
export function fromSource(...segments: string[]) {
  return join(SOURCE, ...segments);
}

/** Monta um path do ROOT até algum arquivo/pasta
 */
export function fromRoot(...segments: string[]) {
  return join(ROOT, ...segments);
}