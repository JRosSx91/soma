/**
 * Builds the public password-reset link from a configured app origin only.
 * Never derive the authority from Host / Origin / Referer request headers.
 */

export class PasswordResetUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordResetUrlError";
  }
}

export function resolveAppPublicOrigin(): string {
  const raw = (process.env.APP_PUBLIC_URL ?? "").trim().replace(/\/$/, "");
  if (!raw) {
    throw new PasswordResetUrlError(
      "APP_PUBLIC_URL is not configured",
    );
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new PasswordResetUrlError("APP_PUBLIC_URL is not a valid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new PasswordResetUrlError("APP_PUBLIC_URL must be http(s)");
  }

  const isProd = process.env.NODE_ENV === "production";
  if (isProd && url.protocol !== "https:") {
    throw new PasswordResetUrlError(
      "APP_PUBLIC_URL must use HTTPS in production",
    );
  }

  return url.origin;
}

/**
 * Path reserved for the future SPA reset page (delivery 2+).
 * Frontend should use Referrer-Policy: no-referrer and strip the token
 * from the URL after reading it.
 */
export const PASSWORD_RESET_PATH = "/reset-password";

export function buildPasswordResetUrl(plaintextToken: string): string {
  const origin = resolveAppPublicOrigin();
  const url = new URL(PASSWORD_RESET_PATH, `${origin}/`);
  url.searchParams.set("token", plaintextToken);
  return url.toString();
}
