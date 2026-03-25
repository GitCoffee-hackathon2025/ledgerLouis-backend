import Ajv from "ajv";
import addFormats from "ajv-formats";

export function createValidator() {
  const ajv = new Ajv({
    coerceTypes: true,
    removeAdditional: true,
    allErrors: true,
  });

  addFormats(ajv);

  return ajv;
}
