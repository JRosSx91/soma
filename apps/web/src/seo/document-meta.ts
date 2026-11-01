import {
  DEFAULT_DOCUMENT_DESCRIPTION,
  DEFAULT_DOCUMENT_TITLE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_OG_IMAGE_WIDTH,
  LANDING_JSON_LD_SCRIPT_ID,
  PUBLIC_LANDING_URL,
  isIndexablePublicPath,
  landingWebApplicationJsonLd,
  robotsContentForPath,
} from "./public-site.js";

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
): void {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(attr: "name" | "property", key: string): void {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function removeCanonical(): void {
  document.head.querySelector('link[rel="canonical"]')?.remove();
}

function upsertLandingJsonLd(description: string): void {
  let el = document.getElementById(LANDING_JSON_LD_SCRIPT_ID);
  if (!el) {
    el = document.createElement("script");
    el.id = LANDING_JSON_LD_SCRIPT_ID;
    el.setAttribute("type", "application/ld+json");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(landingWebApplicationJsonLd(description));
}

function removeLandingJsonLd(): void {
  document.getElementById(LANDING_JSON_LD_SCRIPT_ID)?.remove();
}

export type LandingDocumentCopy = {
  title: string;
  description: string;
};

/**
 * Keep robots/canonical in sync after client-side navigations.
 * Direct loads are handled first by the inline script in `index.html`.
 */
export function syncDocumentSeo(
  pathname: string,
  landing?: LandingDocumentCopy,
): void {
  upsertMeta("name", "robots", robotsContentForPath(pathname));

  if (!isIndexablePublicPath(pathname)) {
    removeCanonical();
    removeMeta("property", "og:url");
    removeLandingJsonLd();
    return;
  }

  upsertCanonical(PUBLIC_LANDING_URL);
  upsertMeta("property", "og:url", PUBLIC_LANDING_URL);
  const title = landing?.title ?? DEFAULT_DOCUMENT_TITLE;
  const description = landing?.description ?? DEFAULT_DOCUMENT_DESCRIPTION;
  upsertMeta("name", "description", description);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:image", DEFAULT_OG_IMAGE_URL);
  upsertMeta("property", "og:image:width", String(DEFAULT_OG_IMAGE_WIDTH));
  upsertMeta("property", "og:image:height", String(DEFAULT_OG_IMAGE_HEIGHT));
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", DEFAULT_OG_IMAGE_URL);
  upsertLandingJsonLd(description);
}
