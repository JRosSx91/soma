import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32; // 256 bits

/** Opaque refresh token (URL-safe base64). Never persist this value. */
export function generateRefreshTokenPlaintext(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** SHA-256 hex digest used as the sole persisted representation. */
export function hashRefreshToken(plaintext: string): string {
  return createHash("sha256").update(plaintext, "utf8").digest("hex");
}

/** Privacy-preserving fingerprint of a client IP (optional). */
export function hashClientIp(ip: string | undefined): string | null {
  if (!ip) return null;
  const trimmed = ip.trim();
  if (!trimmed) return null;
  return createHash("sha256").update(trimmed, "utf8").digest("hex");
}

export function truncateUserAgent(userAgent: string | undefined, max = 256): string | null {
  if (!userAgent) return null;
  const trimmed = userAgent.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}
