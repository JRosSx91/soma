import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  DEFAULT_DOCUMENT_DESCRIPTION,
  DEFAULT_DOCUMENT_TITLE,
  PUBLIC_LANDING_URL,
  PUBLIC_SITEMAP_URL,
  RENDER_X_ROBOTS_NOINDEX_PATHS,
  isIndexablePublicPath,
  robotsContentForPath,
} from "./public-site.js";

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
  assert.match(html, /name="twitter:card"/);
  assert.equal(html.includes("hreflang"), false);
  assert.match(html, /if \(path === "\/" \|\| path === ""\) return;/);
  assert.match(html, /robots\.setAttribute\("content", "noindex,nofollow"\)/);
  assert.match(html, /canonical\.parentNode\.removeChild\(canonical\)/);
  assert.match(html, /ogUrl\.parentNode\.removeChild\(ogUrl\)/);
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
  assert.equal(/cure|clinically validated|medical device/.test(blob), false);
});
