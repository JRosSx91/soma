function positiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.floor(value);
}

/** POST /me/feedback: 8 writes / 15 minutes / IP (default). */
export const FEEDBACK_POST_THROTTLE = {
  limit: positiveInt(process.env.FEEDBACK_POST_THROTTLE_LIMIT, 8),
  ttl: positiveInt(process.env.FEEDBACK_POST_THROTTLE_TTL_MS, 15 * 60 * 1000),
} as const;
