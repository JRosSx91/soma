import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enCommon from "../../../i18n/locales/en/common.json" with { type: "json" };
import esCommon from "../../../i18n/locales/es/common.json" with { type: "json" };

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const boot = read("../../../components/AppBootScreen.tsx");
const app = read("../../../App.tsx");
const protectedRoute = read("../../../components/ProtectedRoute.tsx");
const auth = read("../context/AuthContext.tsx");

test("boot screen uses the Soma mark, the landing canvas and an accessible status", () => {
  assert.match(boot, /<SomaMark \/>/);
  assert.match(boot, /bg-\[#081018\]/);
  assert.match(boot, /role="status"/);
  assert.match(boot, /aria-live="polite"/);
  assert.match(boot, /motion-safe:animate-pulse/);
  assert.match(boot, /t\("boot\.preparing"\)/);
  assert.match(boot, /t\("boot\.slowServer"\)/);
});

test("boot copy exists in spanish and english", () => {
  assert.equal(esCommon.boot.preparing, "Preparando tu espacio…");
  assert.equal(
    esCommon.boot.slowServer,
    "Estamos conectando con el servidor. La primera conexión puede tardar un poco más.",
  );
  assert.equal(typeof enCommon.boot.preparing, "string");
  assert.equal(typeof enCommon.boot.slowServer, "string");
  assert.notEqual(enCommon.boot.preparing, esCommon.boot.preparing);
  assert.notEqual(enCommon.boot.slowServer, esCommon.boot.slowServer);
});

test("protected routes keep the boot screen while auth is checking; public / does not", () => {
  assert.doesNotMatch(app, /from "\.\/components\/AppBootScreen/);
  assert.match(app, /rootRouteView\(/);
  assert.match(protectedRoute, /if \(loading\) \{\s*return <AppBootScreen \/>;/);
  assert.match(
    protectedRoute,
    /Navigate to=\{unauthenticatedDestination\(sessionNotice\)\}/,
  );
  assert.match(auth, /const loading = status === "checking";/);
  assert.equal(auth.includes("AppBootScreen"), false);
});

test("boot screen shows no personal data and makes no requests of its own", () => {
  for (const forbidden of [
    "useAuth",
    "user",
    "substance",
    "profile",
    "email",
    "fetch(",
    "apiRequest",
    "http",
    "analytics",
  ]) {
    assert.equal(boot.includes(forbidden), false, forbidden);
  }
  assert.equal(boot.includes("setInterval"), false);
  assert.match(boot, /window\.clearTimeout/);
});
