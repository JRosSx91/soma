import type { CookieOptions, Response } from "express";

export const REFRESH_COOKIE_NAME = "soma_refresh";

/**
 * Cookie policy for the opaque refresh token.
 *
 * Cross-origin SPA (e.g. localhost:5173 → :3000) requires SameSite=None and
 * Secure; browsers reject SameSite=None without Secure. Local HTTP therefore
 * needs a same-site reverse proxy, HTTPS, or delivery 3 client wiring that
 * understands these constraints.
 */
export function refreshCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  const secure =
    process.env.AUTH_COOKIE_SECURE === "true" ||
    (process.env.AUTH_COOKIE_SECURE !== "false" && isProd);

  const sameSiteEnv = (process.env.AUTH_COOKIE_SAMESITE ?? "").toLowerCase();
  let sameSite: CookieOptions["sameSite"] = "lax";
  if (sameSiteEnv === "none" || sameSiteEnv === "lax" || sameSiteEnv === "strict") {
    sameSite = sameSiteEnv;
  } else if (secure && isProd) {
    // Cross-site API + SPA in production typically needs None+Secure.
    sameSite = process.env.AUTH_COOKIE_CROSS_SITE === "true" ? "none" : "lax";
  }

  if (sameSite === "none" && !secure) {
    // Browsers will drop the cookie; force Secure to keep the pair valid.
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/auth",
      maxAge: refreshCookieMaxAgeMs(),
    };
  }

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/auth",
    maxAge: refreshCookieMaxAgeMs(),
  };
}

export function refreshCookieMaxAgeMs(): number {
  const days = Number(process.env.AUTH_REFRESH_EXPIRES_DAYS ?? "14");
  const safeDays = Number.isFinite(days) && days > 0 ? days : 14;
  return Math.floor(safeDays * 24 * 60 * 60 * 1000);
}

export function setRefreshCookie(res: Response, plaintext: string): void {
  res.cookie(REFRESH_COOKIE_NAME, plaintext, refreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  const options = refreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
}
