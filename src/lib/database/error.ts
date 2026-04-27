export function isUniqueConstraint(err: any, constraint: string): boolean {
  const e = err?.cause ?? err;

  return (
    (e?.code === "ER_DUP_ENTRY" || e?.errno === 1062) &&
    typeof e?.sqlMessage === "string" &&
    e.sqlMessage.includes(constraint)
  );
}
