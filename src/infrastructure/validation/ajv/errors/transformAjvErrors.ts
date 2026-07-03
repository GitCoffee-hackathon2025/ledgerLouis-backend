import type { ErrorObject } from "ajv";

/* 
ErrorObject: {
  "keyword": "minLength",
  "instancePath": "/password",
  "params": {
    "limit": 8
  },
  "message": "must NOT have fewer than 8 characters"
}
*/

function getMessage(err: ErrorObject): string {
  switch (err.keyword) {
    case "required":
      return "Field is required";

    case "minLength":
      return `Must have at least ${err.params.limit} characters`;

    case "maxLength":
      return `Must have at most ${err.params.limit} characters`;

    case "format":
      if ((err.params as Record<string, string>).format === "email")
        return "Invalid email format";

      return "Invalid format";

    default:
      return err.message ?? "Invalid value";
  }
}

export function transformAjvErrors(errors: ErrorObject[]) {
  const fields: Record<string, string[]> = {};

  for (const err of errors) {
    let field: string = err.instancePath.replace(/^\//, "");

    if (err.keyword === "required")
      field = (err.params as { missingProperty: string }).missingProperty;

    field = field.replace(/\//g, ".").replace(/\.(\d+)(?=\.|$)/g, "[$1]");

    if (!field) field = "body";
    fields[field] ??= [];

    fields[field]!.push(getMessage(err));
  }

  return fields;
}
