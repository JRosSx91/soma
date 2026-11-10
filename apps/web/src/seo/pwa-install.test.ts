import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

function pngSize(path: string): { width: number; height: number; colorType: number } {
  const bytes = readFileSync(path);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25] ?? -1,
  };
}

test("web app manifest is installable without a service worker", () => {
  const raw = readFileSync(join(webRoot, "public/manifest.webmanifest"), "utf8");
  const manifest = JSON.parse(raw) as {
    id: string;
    name: string;
    short_name: string;
    start_url: string;
    scope: string;
    display: string;
    theme_color: string;
    background_color: string;
    icons: { src: string; sizes: string; type: string; purpose: string }[];
  };
  assert.equal(manifest.name, "SOMA");
  assert.equal(manifest.short_name, "SOMA");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.theme_color, "#061018");
  assert.equal(manifest.background_color, "#061018");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.id, "/");
  assert.deepEqual(
    manifest.icons.map((icon) => `${icon.purpose}:${icon.sizes}`).sort(),
    [
      "any:192x192",
      "any:512x512",
      "maskable:192x192",
      "maskable:512x512",
    ],
  );
  for (const icon of manifest.icons) {
    assert.equal(icon.type, "image/png");
    assert.match(icon.src, /^\/pwa-\d+x\d+(?:-maskable)?\.png$/);
    assert.equal(icon.src.includes("maskable"), icon.purpose === "maskable");
  }
});

test("PWA icons are 192 and 512 RGBA PNGs derived from FAV-01", () => {
  const source = pngSize(join(webRoot, "public/soma-favicon.png"));
  assert.equal(source.width, 1254);
  assert.equal(source.height, 1254);
  assert.equal(source.colorType, 6);
  const files = [
    ["pwa-192x192.png", 192],
    ["pwa-512x512.png", 512],
    ["pwa-192x192-maskable.png", 192],
    ["pwa-512x512-maskable.png", 512],
  ] as const;
  for (const [name, size] of files) {
    const info = pngSize(join(webRoot, "public", name));
    assert.equal(info.width, size, name);
    assert.equal(info.height, size, name);
    assert.equal(info.colorType, 6, name);
  }
});

test("index.html links the manifest and iOS install metadata", () => {
  const html = readFileSync(join(webRoot, "index.html"), "utf8");
  assert.match(html, /<link rel="manifest" href="\/manifest.webmanifest" \/>/);
  assert.match(html, /<meta name="color-scheme" content="dark" \/>/);
  assert.match(
    html,
    /html,\s*body\s*\{\s*background-color:\s*#061018;\s*\}/,
  );
  assert.match(html, /<meta name="theme-color" content="#061018" \/>/);
  assert.match(html, /<meta name="mobile-web-app-capable" content="yes" \/>/);
  assert.match(
    html,
    /<meta name="apple-mobile-web-app-capable" content="yes" \/>/,
  );
  assert.match(
    html,
    /<meta name="apple-mobile-web-app-title" content="SOMA" \/>/,
  );
  assert.match(
    html,
    /<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" \/>/,
  );
  assert.match(html, /<link rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon.png" \/>/);
  assert.match(
    html,
    /<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" \/>/,
  );
  assert.equal(html.includes("serviceWorker"), false);
  assert.equal(html.includes("navigator.serviceWorker"), false);
});

test("production web sources do not register a service worker", () => {
  const haystacks: string[] = [
    readFileSync(join(webRoot, "index.html"), "utf8"),
    readFileSync(join(webRoot, "vite.config.ts"), "utf8"),
    readFileSync(join(webRoot, "package.json"), "utf8"),
    readFileSync(join(webRoot, "public/manifest.webmanifest"), "utf8"),
  ];
  function walk(dir: string) {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(path);
        continue;
      }
      if (/\.test\.(ts|tsx)$/.test(ent.name)) continue;
      if (/\.(ts|tsx|js|mjs)$/.test(ent.name)) {
        haystacks.push(readFileSync(path, "utf8"));
      }
    }
  }
  walk(join(webRoot, "src"));
  for (const text of haystacks) {
    assert.equal(text.includes("navigator.serviceWorker"), false);
    assert.equal(text.includes("service-worker"), false);
    assert.equal(text.includes("vite-plugin-pwa"), false);
    assert.equal(text.includes("workbox"), false);
  }
});
