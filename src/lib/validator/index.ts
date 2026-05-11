import { Ajv } from "ajv";
import addFormats from "ajv-formats";

import { isValidCNPJ } from "cnpj-cpf-validator";

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

  ajv.addFormat("cnpj", {
    type: "string",
    validate: (value: string) => isValidCNPJ(value),
  });

  return ajv;
}
