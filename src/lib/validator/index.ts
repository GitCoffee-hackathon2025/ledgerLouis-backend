import { Ajv } from "ajv";
import addFormats from "ajv-formats";

import { isValidCNPJ } from "cnpj-cpf-validator";
import { isValidId } from "../id.js";

export function createValidator() {
  const ajv = new Ajv({
    coerceTypes: true,
    removeAdditional: true,
    allErrors: true,
    useDefaults: true,
    strict: false,
    allowUnionTypes: true,
  });

  addFormats.default(ajv);

  ajv.addFormat("ulid", {
    type: "string",
    validate: (v: string) => isValidId(v),
  });

  ajv.addFormat("cnpj", {
    type: "string",
    validate: (v: string) => isValidCNPJ(v),
  });

  return ajv;
}
