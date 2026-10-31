/**
 * Fail-closed production environment checks.
 *
 * Called from API bootstrap before Nest listens. Outside production this
 * is a no-op so local development and tests keep their existing defaults.
 *
 * JWT_SECRET: a 32-byte minimum is only a basic length barrier. Production
 * must use a cryptographically random secret, preferably ≥ 256 bits.
 * Error messages never include the secret value.
 */

export class ProductionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductionConfigError";
  }
}

export const MIN_JWT_SECRET_BYTES = 32;
export const MAX_JWT_EXPIRES_SECONDS = 60 * 60;
export const DEFAULT_JWT_EXPIRES_IN = "15m";

const PLACEHOLDER_SECRETS = new Set([
  "replace-with-a-long-random-secret",
  "changeme",
  "your-secret-here",
  "jwt_secret",
  "secret",
]);

export function isProductionEnv(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (env.NODE_ENV ?? "").trim() === "production";
}

function isPlaceholderSecret(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (PLACEHOLDER_SECRETS.has(normalized)) return true;
  if (normalized.includes("replace-with-a-long-random")) return true;
  if (normalized.includes("change_in_production")) return true;
  if (normalized.includes("change-in-production")) return true;
  if (normalized.startsWith("development_only")) return true;
  return false;
}

/**
 * Parses Nest/jsonwebtoken `expiresIn` into seconds.
 *
 * jsonwebtoken passes strings through `ms()`. A unitless numeric string
 * is milliseconds there, while a number type is seconds. Env vars are
 * always strings, so unitless values like "3600" would mint ~3.6s tokens
 * while looking like one hour. Those forms are rejected.
 *
 * Compact units match `ms` / `@nestjs/jwt`: ms, s, m, h, d.
 */
export function parseJwtExpiresDurationSeconds(raw: string): number {
  const value = raw.trim();
  if (!value) {
    throw new ProductionConfigError("JWT_EXPIRES_IN is invalid");
  }
  if (/^\d+(\.\d+)?$/.test(value)) {
    throw new ProductionConfigError(
      "JWT_EXPIRES_IN must include a unit (e.g. 15m, 1h, 3600s); unitless numbers are ambiguous",
    );
  }
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h|d)$/i.exec(value);
  if (!match) {
    throw new ProductionConfigError("JWT_EXPIRES_IN is invalid");
  }
  const amount = Number(match[1]);
  const unit = match[2]!.toLowerCase();
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ProductionConfigError("JWT_EXPIRES_IN is invalid");
  }
  const seconds =
    unit === "ms"
      ? amount / 1000
      : unit === "s"
        ? amount
        : unit === "m"
          ? amount * 60
          : unit === "h"
            ? amount * 3600
            : amount * 86400;
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new ProductionConfigError("JWT_EXPIRES_IN is invalid");
  }
  return seconds;
}

function assertJwtSecret(env: NodeJS.ProcessEnv): void {
  const secret = (env.JWT_SECRET ?? "").trim();
  if (!secret) {
    throw new ProductionConfigError("JWT_SECRET is required in production");
  }
  if (isPlaceholderSecret(secret)) {
    throw new ProductionConfigError(
      "JWT_SECRET must not use a documented example or placeholder value",
    );
  }
  if (Buffer.byteLength(secret, "utf8") < MIN_JWT_SECRET_BYTES) {
    throw new ProductionConfigError(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_BYTES} bytes (length barrier only; generate ≥ 256 bits of cryptographic randomness)`,
    );
  }
}

function assertCorsOrigin(env: NodeJS.ProcessEnv): void {
  const raw = (env.CORS_ORIGIN ?? "").trim();
  if (!raw) {
    throw new ProductionConfigError("CORS_ORIGIN is required in production");
  }
  if (raw === "*" || raw.includes(",")) {
    throw new ProductionConfigError(
      "CORS_ORIGIN must be a single https origin",
    );
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ProductionConfigError("CORS_ORIGIN is not a valid URL");
  }
  if (url.protocol !== "https:") {
    throw new ProductionConfigError("CORS_ORIGIN must be an https origin");
  }
  if (url.username || url.password) {
    throw new ProductionConfigError("CORS_ORIGIN must be an https origin");
  }
  const path = url.pathname;
  if ((path && path !== "/") || url.search || url.hash) {
    throw new ProductionConfigError(
      "CORS_ORIGIN must be a single origin (no path or query)",
    );
  }
}

function assertRegistrationMode(env: NodeJS.ProcessEnv): void {
  const raw = (env.AUTH_REGISTRATION_MODE ?? "").trim().toLowerCase();
  if (!raw) {
    throw new ProductionConfigError(
      "AUTH_REGISTRATION_MODE must be set to \"open\" or \"invite\" in production",
    );
  }
  if (raw !== "open" && raw !== "invite") {
    throw new ProductionConfigError(
      "AUTH_REGISTRATION_MODE must be \"open\" or \"invite\" in production",
    );
  }
}

function assertCookieSecure(env: NodeJS.ProcessEnv): void {
  const raw = (env.AUTH_COOKIE_SECURE ?? "").trim().toLowerCase();
  if (raw === "false") {
    throw new ProductionConfigError(
      "AUTH_COOKIE_SECURE=false is not allowed in production",
    );
  }
}

function assertJwtExpiresIn(env: NodeJS.ProcessEnv): void {
  const raw = (env.JWT_EXPIRES_IN ?? "").trim();
  if (!raw) return;
  const seconds = parseJwtExpiresDurationSeconds(raw);
  if (seconds > MAX_JWT_EXPIRES_SECONDS) {
    throw new ProductionConfigError(
      "JWT_EXPIRES_IN must not exceed 1 hour in production",
    );
  }
}

export function assertSecureProductionEnv(
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (!isProductionEnv(env)) return;
  assertJwtSecret(env);
  assertRegistrationMode(env);
  assertCorsOrigin(env);
  assertCookieSecure(env);
  assertJwtExpiresIn(env);
}
