function positiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.floor(value);
}

/** POST/PATCH: 30 writes / 10 minutes / IP (default). */
export const JOURNAL_WRITE_THROTTLE = {
  limit: positiveInt(process.env.JOURNAL_WRITE_THROTTLE_LIMIT, 30),
  ttl: positiveInt(process.env.JOURNAL_WRITE_THROTTLE_TTL_MS, 10 * 60 * 1000),
} as const;

/** GET export: 10 / 15 minutes / IP (default). */
export const JOURNAL_EXPORT_THROTTLE = {
  limit: positiveInt(process.env.JOURNAL_EXPORT_THROTTLE_LIMIT, 10),
  ttl: positiveInt(process.env.JOURNAL_EXPORT_THROTTLE_TTL_MS, 15 * 60 * 1000),
} as const;

/** DELETE all: 5 / 15 minutes / IP (default). */
export const JOURNAL_WIPE_THROTTLE = {
  limit: positiveInt(process.env.JOURNAL_WIPE_THROTTLE_LIMIT, 5),
  ttl: positiveInt(process.env.JOURNAL_WIPE_THROTTLE_TTL_MS, 15 * 60 * 1000),
} as const;
