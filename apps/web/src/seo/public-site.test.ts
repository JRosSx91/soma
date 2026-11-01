import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  DEFAULT_DOCUMENT_DESCRIPTION,
  DEFAULT_DOCUMENT_TITLE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_OG_IMAGE_WIDTH,
  LANDING_JSON_LD_SCRIPT_ID,
  PUBLIC_LANDING_URL,
  PUBLIC_SITEMAP_URL,
  RENDER_X_ROBOTS_NOINDEX_PATHS,
  isIndexablePublicPath,
  landingWebApplicationJsonLd,
  robotsContentForPath,
} from "./public-site.js";
import enLanding from "../i18n/locales/en/landing-v2.json" with { type: "json" };
import esLanding from "../i18n/locales/es/landing-v2.json" with { type: "json" };

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("only the site root is indexable", () => {
  assert.equal(isIndexablePublicPath("/"), true);
  assert.equal(isIndexablePublicPath(""), true);
  assert.equal(isIndexablePublicPath("/?utm=1"), true);
  assert.equal(robotsContentForPath("/"), "index,follow");

  for (const path of [
    "/app",
    "/app/journal",
    "/preview",
    "/preview/missions",
    "/login",
    "/register",
    "/legal",
    "/privacy",
    "/terms",
    "/cookies",
    "/onboarding",
    "/reset-password",
    "/forgot-password",
    "/achievements",
    "/app-legacy",
    "/unknown",
  ]) {
    assert.equal(isIndexablePublicPath(path), false, path);
    assert.equal(robotsContentForPath(path), "noindex,nofollow", path);
  }
});

test("index.html is indexable without JavaScript and strips private routes in the head script", () => {
  const html = readFileSync(join(webRoot, "index.html"), "utf8");
  const markupBeforeModules = html.slice(0, html.indexOf('<script type="module"'));
  assert.equal(html.includes("<title>web</title>"), false);
  assert.match(html, new RegExp(`<title>${DEFAULT_DOCUMENT_TITLE}</title>`));
  assert.match(
    html,
    new RegExp(DEFAULT_DOCUMENT_DESCRIPTION.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
  assert.match(markupBeforeModules, /<meta\s+name="robots"\s+content="index,follow"\s*\/>/);
  assert.match(
    markupBeforeModules,
    /<link\s+rel="canonical"\s+href="https:\/\/somarecovery\.app\/"\s*\/>/,
  );
  assert.match(
    markupBeforeModules,
    /<meta\s+property="og:url"\s+content="https:\/\/somarecovery\.app\/"\s*\/>/,
  );
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /property="og:image:width" content="1828"/);
  assert.match(html, /property="og:image:height" content="860"/);
  assert.match(html, /name="twitter:card"/);
  assert.match(html, /name="twitter:title"/);
  assert.match(html, /name="twitter:description"/);
  assert.match(html, /name="twitter:image"/);
  assert.equal(html.includes("hreflang"), false);
  assert.match(html, /<noscript>/);
  assert.match(html, /JavaScript is required to use the application/);
  assert.match(html, /id="soma-jsonld"/);
  assert.match(html, /if \(path === "\/" \|\| path === ""\) return;/);
  assert.match(html, /robots\.setAttribute\("content", "noindex,nofollow"\)/);
  assert.match(html, /canonical\.parentNode\.removeChild\(canonical\)/);
  assert.match(html, /ogUrl\.parentNode\.removeChild\(ogUrl\)/);
  assert.match(html, /getElementById\("soma-jsonld"\)/);
  const headScriptIndex = html.indexOf('if (path === "/" || path === "") return;');
  const reactIndex = html.indexOf('src="/src/main.tsx"');
  assert.ok(headScriptIndex > 0 && reactIndex > headScriptIndex);
});

test("robots.txt allows crawling and Render header paths stay off a global /*", () => {
  const robots = readFileSync(join(webRoot, "public/robots.txt"), "utf8");
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.equal(/^Disallow:/m.test(robots), false);
  assert.match(robots, new RegExp(`^Sitemap: ${PUBLIC_SITEMAP_URL}$`, "m"));
  assert.equal(RENDER_X_ROBOTS_NOINDEX_PATHS.includes("/*"), false);
  assert.ok(RENDER_X_ROBOTS_NOINDEX_PATHS.includes("/app-legacy"));
  for (const legal of ["/legal", "/privacy", "/terms", "/cookies"] as const) {
    assert.ok(RENDER_X_ROBOTS_NOINDEX_PATHS.includes(legal), legal);
  }
});

test("sitemap.xml lists only the public landing", () => {
  const sitemap = readFileSync(join(webRoot, "public/sitemap.xml"), "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(locs, [PUBLIC_LANDING_URL]);
  for (const leak of ["/app", "/preview", "/login", "/journal", "/missions"]) {
    assert.equal(sitemap.includes(leak), false, leak);
  }
});

test("default document copy stays educational and non-clinical", () => {
  const blob = `${DEFAULT_DOCUMENT_TITLE} ${DEFAULT_DOCUMENT_DESCRIPTION}`.toLowerCase();
  assert.equal(blob.includes("diagnos"), true);
  assert.equal(blob.includes("educational"), true);
  assert.equal(/cure|clinically validated|medical device/.test(blob), false);
  assert.ok(DEFAULT_DOCUMENT_DESCRIPTION.length <= 160);
  assert.equal(enLanding.metaTitle, DEFAULT_DOCUMENT_TITLE);
  assert.equal(enLanding.metaDescription, DEFAULT_DOCUMENT_DESCRIPTION);
  assert.equal(esLanding.metaTitle.includes("educativ"), true);
  assert.equal(esLanding.metaDescription.toLowerCase().includes("diagnóst"), true);
});

test("homepage JSON-LD describes a free educational WebApplication", () => {
  const html = readFileSync(join(webRoot, "index.html"), "utf8");
  const ldMatch = html.match(
    /<script id="soma-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(ldMatch);
  const parsed = JSON.parse(ldMatch[1]) as ReturnType<typeof landingWebApplicationJsonLd>;
  const expected = landingWebApplicationJsonLd();
  assert.deepEqual(parsed, expected);
  assert.equal(expected["@type"], "WebApplication");
  assert.equal(expected.applicationCategory, "EducationalApplication");
  assert.equal(expected.url, PUBLIC_LANDING_URL);
  assert.equal(expected.offers.price, 0);
  assert.equal(expected.offers.priceCurrency, "EUR");
  assert.equal("aggregateRating" in expected, false);
  assert.equal(LANDING_JSON_LD_SCRIPT_ID, "soma-jsonld");
  const metaSrc = readFileSync(new URL("./document-meta.ts", import.meta.url), "utf8");
  assert.match(metaSrc, /removeLandingJsonLd\(\)/);
  assert.match(metaSrc, /twitter:image/);
  assert.equal(DEFAULT_OG_IMAGE_WIDTH, 1828);
  assert.equal(DEFAULT_OG_IMAGE_HEIGHT, 860);
  assert.match(DEFAULT_OG_IMAGE_URL, /hero-holographic-anatomy\.png$/);
});
