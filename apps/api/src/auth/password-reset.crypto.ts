import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32; // 256 bits

/** Opaque password-reset token (URL-safe). Never persist or log this value. */
export function generatePasswordResetPlaintext(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** SHA-256 hex digest — sole persisted representation of a reset token. */
export function hashPasswordResetToken(plaintext: string): string {
  return createHash("sha256").update(plaintext, "utf8").digest("hex");
}

export function passwordResetTtlMs(): number {
  const raw = process.env.AUTH_PASSWORD_RESET_EXPIRES_MINUTES;
  const minutes =
    raw === undefined || raw === ""
      ? 30
      : Number(raw);
  const safe =
    Number.isFinite(minutes) && minutes > 0 && minutes <= 24 * 60
      ? minutes
      : 30;
  return Math.floor(safe * 60 * 1000);
}
