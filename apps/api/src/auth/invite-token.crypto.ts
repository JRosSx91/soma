import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32;

/** Opaque registration-invite token (URL-safe). Never persist or log this value. */
export function generateRegistrationInvitePlaintext(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** SHA-256 hex digest — sole persisted representation of an invite token. */
export function hashRegistrationInviteToken(plaintext: string): string {
  return createHash("sha256").update(plaintext, "utf8").digest("hex");
}

export function isRegistrationInviteTokenFormat(value: string): boolean {
  return value.length >= 20 && value.length <= 64 && /^[A-Za-z0-9_-]+$/.test(value);
}

export function registrationInviteTtlMs(): number {
  const raw = process.env.AUTH_INVITE_EXPIRES_DAYS;
  const days =
    raw === undefined || raw === "" ? 14 : Number(raw);
  const safe = Number.isFinite(days) && days > 0 && days <= 365 ? days : 14;
  return Math.floor(safe * 24 * 60 * 60 * 1000);
}
