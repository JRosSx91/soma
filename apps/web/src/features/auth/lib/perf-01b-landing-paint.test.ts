import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import type { AuthState } from "../types.js";
import { rootRouteView } from "./root-route-view.js";

type AuthSlice = Pick<AuthState, "user" | "loading" | "status" | "sessionNotice">;

function ProtectedProbe({ auth }: { auth: AuthSlice }) {
  if (auth.loading) {
    return createElement("div", { "data-boot": "protected" }, "boot");
  }
  if (!auth.user) {
    return createElement("div", { "data-redirect": "login" }, "login");
  }
  return createElement("div", { "data-private": "ok" }, "private");
}

test("landing decision is independent of a pending refresh", () => {
  assert.equal(
    rootRouteView({ loading: true, user: null, sessionNotice: null }),
    "landing",
  );
  const markup = renderToStaticMarkup(
    createElement(
      "main",
      { "data-landing": "pending-refresh" },
      rootRouteView({ loading: true, user: null, sessionNotice: null }),
    ),
  );
  assert.match(markup, /data-landing="pending-refresh"/);
  assert.match(markup, />landing</);
});

test("protected surface still boots while auth is checking", () => {
  const markup = renderToStaticMarkup(
    createElement(ProtectedProbe, {
      auth: {
        loading: true,
        status: "checking",
        user: null,
        sessionNotice: null,
      },
    }),
  );
  assert.match(markup, /data-boot="protected"/);
  assert.equal(markup.includes("data-private"), false);
});

test("protected surface redirects anonymous visitors after restore", () => {
  const markup = renderToStaticMarkup(
    createElement(ProtectedProbe, {
      auth: {
        loading: false,
        status: "anonymous",
        user: null,
        sessionNotice: null,
      },
    }),
  );
  assert.match(markup, /data-redirect="login"/);
});

test("late refresh completion only gates authenticated visitors", () => {
  assert.equal(
    rootRouteView({ loading: true, user: null, sessionNotice: null }),
    "landing",
  );
  assert.equal(
    rootRouteView({
      loading: false,
      user: { id: "restored" },
      sessionNotice: null,
    }),
    "login-gate",
  );
  assert.equal(
    rootRouteView({ loading: false, user: null, sessionNotice: null }),
    "landing",
  );
});
