export function isUniqueConstraint(err: unknown, constraint?: string): boolean {
  const error = err as any;

  const candidates = [error, error?.cause, error?.cause?.cause];

  for (const e of candidates) {
    if (!e) continue;

    const isDuplicate =
      e.code === "ER_DUP_ENTRY" ||
      e.errno === 1062 ||
      String(e.message).includes("Duplicate entry");

    if (!isDuplicate) continue;

    if (!constraint) return true;

    const text = e.sqlMessage ?? e.message ?? "";

    if (text.includes(constraint)) return true;
  }

  return false;
}
