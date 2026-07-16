export function getUniqueConstraint(
  err: unknown,
  constraints?: readonly string[],
): string | undefined {
  const error = err as any;

  const candidates = [error, error?.cause, error?.cause?.cause];

  for (const e of candidates) {
    if (!e || e.code !== "23505") continue;

    if (!constraints?.length) return e.constraint ?? undefined;

    for (const constraint of constraints) {
      if (e.constraint === constraint) return constraint;

      const text = `${e.detail ?? ""} ${e.message ?? ""}`;

      if (text.includes(constraint)) return constraint;
    }
  }

  return undefined;
}
