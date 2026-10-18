/**
 * Auth endpoint rate limits (in-memory store via @nestjs/throttler).
 *
 * Defaults match the 5A.2 design:
 * - login: 5 attempts / 15 minutes
 * - register: 3 attempts / 1 hour
 *
 * Override with env vars when needed (e.g. local integration tests).
 * In-memory counters are per process — not shared across API replicas.
 */

function positiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.floor(value);
}

export const AUTH_LOGIN_THROTTLE = {
  limit: positiveInt(process.env.AUTH_LOGIN_THROTTLE_LIMIT, 5),
  ttl: positiveInt(process.env.AUTH_LOGIN_THROTTLE_TTL_MS, 15 * 60 * 1000),
} as const;

export const AUTH_REGISTER_THROTTLE = {
  limit: positiveInt(process.env.AUTH_REGISTER_THROTTLE_LIMIT, 3),
  ttl: positiveInt(process.env.AUTH_REGISTER_THROTTLE_TTL_MS, 60 * 60 * 1000),
} as const;
