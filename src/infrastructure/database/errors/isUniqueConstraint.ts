export function isUniqueConstraint(err: unknown, constraint?: string): boolean {
  const error = err as any;

  const candidates = [error, error?.cause, error?.cause?.cause];

  for (const e of candidates) {
    if (!e) continue;

    // PostgreSQL
    if (e.code === "23505") {
      if (!constraint) return true;

      if (e.constraint === constraint) return true;

      const text = `${e.detail ?? ""} ${e.message ?? ""}`;

      if (text.includes(constraint)) return true;
    }
  }

  return false;
}
