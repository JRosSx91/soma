/**
 * Public-site SEO for the Vite SPA (SEO-01A).
 *
 * Production serves one `index.html` for every HTML route (Render static
 * SPA rewrite). That file is the landing: `index,follow`, canonical and
 * `og:url` are in the markup so `/` is indexable without JavaScript.
 *
 * Private/demo/auth paths: Render `X-Robots-Tag: noindex, nofollow` (panel,
 * not this repo) plus the parser-blocking head script and DocumentSeo.
 * robots.txt allows crawling so those tags can be fetched. Sitemap: `/` only.
 * Locale is client-only; no hreflang.
 */

export const PUBLIC_SITE_ORIGIN = "https://somarecovery.app";
export const PUBLIC_LANDING_URL = `${PUBLIC_SITE_ORIGIN}/`;
export const PUBLIC_SITEMAP_URL = `${PUBLIC_SITE_ORIGIN}/sitemap.xml`;

export const DEFAULT_DOCUMENT_TITLE = "Soma — Physiological recovery";

export const DEFAULT_DOCUMENT_DESCRIPTION =
  "Soma is an educational companion for exploring modelled physiological recovery after substance use. Catalog curves are illustrative estimates, not clinical measurements or diagnoses.";

export const DEFAULT_OG_IMAGE_URL = `${PUBLIC_SITE_ORIGIN}/images/landing-v2/hero-holographic-anatomy.png`;

export const DEFAULT_OG_IMAGE_ALT =
  "Educational holographic anatomy illustration from the Soma landing. Not a clinical scan or personal measurement.";

/**
 * Exact Render Header paths for `X-Robots-Tag: noindex, nofollow`.
 * Do not use `/*` — that would also match `/`.
 * `/app/*` is documented by Render as `/app/` and descendants; `/app`
 * without a trailing slash is listed separately. `/app-legacy` is not
 * under `/app/` and needs its own exact path.
 */
export const RENDER_X_ROBOTS_NOINDEX_PATHS = [
  "/app",
  "/app/*",
  "/app-legacy",
  "/preview",
  "/preview/*",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/achievements",
  "/landing-2",
] as const;

export function normalizePathname(pathname: string): string {
  const raw = pathname.split(/[?#]/)[0] || "/";
  if (raw.length > 1 && raw.endsWith("/")) {
    return raw.slice(0, -1);
  }
  return raw || "/";
}

export function isIndexablePublicPath(pathname: string): boolean {
  return normalizePathname(pathname) === "/";
}

export function robotsContentForPath(pathname: string): "index,follow" | "noindex,nofollow" {
  return isIndexablePublicPath(pathname) ? "index,follow" : "noindex,nofollow";
}
