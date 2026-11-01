/**
 * Public-site SEO for the Vite SPA (SEO-01A).
 *
 * Production serves one `index.html` for every HTML route (Render static
 * SPA rewrite). That file is the landing: `index,follow`, canonical and
 * `og:url` are in the markup so `/` is indexable without JavaScript.
 *
 * Private/demo/auth/legal paths: Render `X-Robots-Tag: noindex, nofollow`
 * (Headers on the static site; not applied from this repo) plus the
 * parser-blocking head script and DocumentSeo. robots.txt allows crawling
 * so those tags can be fetched. Sitemap: `/` only. Locale is client-only;
 * no hreflang.
 *
 * Legal routes (`/legal`, `/privacy`, `/terms`, `/cookies`) must be listed
 * as exact Header paths in Render. A missing header leaves only the JS
 * snippet as noindex; crawlers that skip JS would still see index,follow.
 */

export const PUBLIC_SITE_ORIGIN = "https://somarecovery.app";
export const PUBLIC_LANDING_URL = `${PUBLIC_SITE_ORIGIN}/`;
export const PUBLIC_SITEMAP_URL = `${PUBLIC_SITE_ORIGIN}/sitemap.xml`;

export const DEFAULT_DOCUMENT_TITLE =
  "Soma — Educational models of physiological recovery";

export const DEFAULT_DOCUMENT_DESCRIPTION =
  "Soma is an educational web app for exploring modelled physiological recovery after substance use. Catalog curves are estimates, not diagnoses.";

export const DEFAULT_OG_IMAGE_URL = `${PUBLIC_SITE_ORIGIN}/images/landing-v2/hero-holographic-anatomy.png`;

export const DEFAULT_OG_IMAGE_WIDTH = 1828;
export const DEFAULT_OG_IMAGE_HEIGHT = 860;

export const DEFAULT_OG_IMAGE_ALT =
  "Educational holographic anatomy illustration from the Soma landing. Not a clinical scan or personal measurement.";

export const LANDING_JSON_LD_SCRIPT_ID = "soma-jsonld";

export type LandingWebApplicationJsonLd = {
  "@context": "https://schema.org";
  "@type": "WebApplication";
  name: "Soma";
  url: typeof PUBLIC_LANDING_URL;
  applicationCategory: "EducationalApplication";
  operatingSystem: "Web";
  description: string;
  offers: {
    "@type": "Offer";
    price: 0;
    priceCurrency: "EUR";
  };
};

/** Homepage-only JSON-LD. Do not emit this on private, demo, auth, or legal paths. */
export function landingWebApplicationJsonLd(
  description: string = DEFAULT_DOCUMENT_DESCRIPTION,
): LandingWebApplicationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Soma",
    url: PUBLIC_LANDING_URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description,
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "EUR",
    },
  };
}

/**
 * Exact Render Header paths for `X-Robots-Tag: noindex, nofollow`.
 * Do not use `/*` — that would also match `/`.
 * `/app/*` is documented by Render as `/app/` and descendants; `/app`
 * without a trailing slash is listed separately. `/app-legacy` redirects
 * to `/app` inside the auth gate and is not under `/app/`, so it keeps
 * its own exact noindex path.
 */
export const RENDER_X_ROBOTS_NOINDEX_PATHS = [
  "/app",
  "/app/*",
  "/app-legacy",
  "/preview",
  "/preview/*",
  "/login",
  "/register",
  "/legal",
  "/privacy",
  "/terms",
  "/cookies",
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
