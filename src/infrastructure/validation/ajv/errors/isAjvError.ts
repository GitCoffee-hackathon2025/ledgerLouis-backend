import type { ErrorObject } from "ajv";

export function isAjvError(
  error: unknown,
): error is { validation: ErrorObject[] } {
  return (
    typeof error === "object" &&
    error !== null &&
    "validation" in error &&
    Array.isArray((error as any).validation)
  );
}
