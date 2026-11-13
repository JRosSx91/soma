import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { rootRouteView } from "./root-route-view.js";

test("PERF-01B: landing paints while session restore is still checking", () => {
  assert.equal(
    rootRouteView({
      loading: true,
      user: null,
      sessionNotice: null,
    }),
    "landing",
  );
});

test("anonymous after restore stays on the landing", () => {
  assert.equal(
    rootRouteView({
      loading: false,
      user: null,
      sessionNotice: null,
    }),
    "landing",
  );
  assert.equal(
    rootRouteView({
      loading: false,
      user: null,
      sessionNotice: "session_expired",
    }),
    "landing",
  );
});

test("authenticated redirect waits until loading finishes", () => {
  assert.equal(
    rootRouteView({
      loading: true,
      user: { id: "u1" },
      sessionNotice: null,
    }),
    "landing",
    "stale user during checking must not bounce before status settles",
  );
  assert.equal(
    rootRouteView({
      loading: false,
      user: { id: "u1" },
      sessionNotice: null,
    }),
    "login-gate",
  );
});

test("account_deleted and signed_out keep the public home", () => {
  assert.equal(
    rootRouteView({
      loading: false,
      user: null,
      sessionNotice: "account_deleted",
    }),
    "landing",
  );
  assert.equal(
    rootRouteView({
      loading: true,
      user: { id: "stale" },
      sessionNotice: "account_deleted",
    }),
    "landing",
  );
  assert.equal(
    rootRouteView({
      loading: false,
      user: null,
      sessionNotice: "signed_out",
    }),
    "landing",
  );
});

test("App wires rootRouteView and keeps AppBootScreen on protected routes only", () => {
  const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
  const protectedRoute = readFileSync(
    new URL("../../../components/ProtectedRoute.tsx", import.meta.url),
    "utf8",
  );
  assert.match(app, /rootRouteView\(/);
  assert.match(app, /login-gate/);
  assert.match(app, /<LandingV2Page \/>/);
  assert.doesNotMatch(app, /from "\.\/components\/AppBootScreen/);
  assert.doesNotMatch(
    app,
    /if \(loading\) \{\s*return <AppBootScreen \/>;/,
  );
  assert.match(protectedRoute, /if \(loading\) \{\s*return <AppBootScreen \/>;/);
});
