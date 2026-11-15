/**
 * Q-E2E-1 fail-closed environment policy.
 * Only explicit loopback origins are allowed for browser E2E.
 * Rejects production, staging clouds, and non-loopback hosts.
 */

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

/** Host substrings that always fail closed, even if somehow local-looking. */
const BLOCKED_HOST_MARKERS = [
  "somarecovery",
  "supabase",
  "amazonaws",
  "neon.tech",
  "railway",
  "render.com",
  "heroku",
  "fly.io",
  "vercel.app",
  "netlify",
  "prod",
  "staging",
] as const;

export const DEFAULT_E2E_ORIGIN = "http://127.0.0.1:4173";

export type SafeOrigin = {
  origin: string;
  host: string;
  port: string;
};

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/^\[|\]$/g, "");
}

export function isBlockedHost(host: string): boolean {
  const h = normalizeHost(host);
  if (!h) return true;
  return BLOCKED_HOST_MARKERS.some((marker) => h.includes(marker));
}

export function isLoopbackHost(host: string): boolean {
  const h = normalizeHost(host);
  return LOOPBACK_HOSTS.has(h) || h === "::1";
}

/**
 * Validates E2E_BASE_URL / Playwright baseURL.
 * Accepts only http(s) loopback with an explicit port.
 */
export function assertSafeE2eOrigin(raw: string | undefined): SafeOrigin {
  const value = (raw ?? "").trim() || DEFAULT_E2E_ORIGIN;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`E2E refuse: invalid base URL "${value}"`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`E2E refuse: protocol must be http(s), got "${url.protocol}"`);
  }

  if (url.username || url.password) {
    throw new Error("E2E refuse: credentials in base URL are not allowed");
  }

  if (isBlockedHost(url.hostname)) {
    throw new Error(`E2E refuse: blocked host "${url.hostname}"`);
  }

  if (!isLoopbackHost(url.hostname)) {
    throw new Error(
      `E2E refuse: host must be loopback (127.0.0.1/localhost), got "${url.hostname}"`,
    );
  }

  if (!url.port) {
    throw new Error("E2E refuse: explicit port required on base URL");
  }

  // Strip path/query/hash — origin only.
  const origin = `${url.protocol}//${url.hostname}:${url.port}`;
  return { origin, host: url.hostname, port: url.port };
}

/**
 * Same-origin API paths that Vite may proxy to Nest in normal preview.
 * Blocked in E2E so an empty VITE_API_URL cannot still reach a local API.
 */
const BLOCKED_SPA_API_PREFIXES = ["/auth", "/me", "/health", "/substances"] as const;

function isBlockedSpaApiPath(pathname: string): boolean {
  return BLOCKED_SPA_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * True when a network request may proceed during DEMO smoke.
 * Allows only the approved loopback SPA origin (and browser internals).
 * Refuses SPA-origin API paths that would otherwise hit Nest via preview proxy.
 */
export function isAllowedE2eRequestUrl(
  requestUrl: string,
  allowedOrigin: string,
): boolean {
  if (
    requestUrl.startsWith("data:") ||
    requestUrl.startsWith("blob:") ||
    requestUrl.startsWith("about:")
  ) {
    return true;
  }

  let url: URL;
  try {
    url = new URL(requestUrl);
  } catch {
    return false;
  }

  if (isBlockedHost(url.hostname)) return false;
  if (!isLoopbackHost(url.hostname)) return false;

  const allowed = new URL(allowedOrigin);
  if (
    url.protocol !== allowed.protocol ||
    normalizeHost(url.hostname) !== normalizeHost(allowed.hostname) ||
    url.port !== allowed.port
  ) {
    return false;
  }

  if (isBlockedSpaApiPath(url.pathname)) return false;
  return true;
}

/** Refuse production-like API hints before browsers launch. */
export function assertSafeApiHint(raw: string | undefined): void {
  const value = (raw ?? "").trim();
  if (!value) return;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`E2E refuse: invalid E2E_API_URL hint "${value}"`);
  }
  if (isBlockedHost(url.hostname) || !isLoopbackHost(url.hostname)) {
    throw new Error(`E2E refuse: API hint host not allowed ("${url.hostname}")`);
  }
}
