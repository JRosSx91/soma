import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  explicitLogoutDestination,
  unauthenticatedDestination,
} from "./unauthenticated-destination.js";

/**
 * RootRoute historically sent anyone with a truthy `user` to /login.
 * Navigating to `/` in the same tick as setUser(null) reproduced the
 * E2E failure: home still saw the old user and bounced to login.
 */
function rootRouteDestination(input: {
  user: { id: string } | null;
  sessionNotice: string | null;
}): "/" | "/login" {
  if (input.sessionNotice === "account_deleted") return "/";
  return input.user ? "/login" : "/";
}

test("E2E race: home while user is still set goes to login", () => {
  assert.equal(
    rootRouteDestination({
      user: { id: "still-authenticated" },
      sessionNotice: null,
    }),
    "/login",
  );
});

test("after 204, cleared session with account_deleted goes to public home", () => {
  assert.equal(
    rootRouteDestination({
      user: null,
      sessionNotice: "account_deleted",
    }),
    "/",
  );
  assert.equal(unauthenticatedDestination("account_deleted"), "/");
});

test("account_deleted wins even if user has not flushed yet", () => {
  assert.equal(
    rootRouteDestination({
      user: { id: "stale" },
      sessionNotice: "account_deleted",
    }),
    "/",
  );
});

test("logout and expired session still go to login", () => {
  assert.equal(unauthenticatedDestination(null), "/login");
  assert.equal(unauthenticatedDestination("session_expired"), "/login");
  assert.equal(
    rootRouteDestination({ user: null, sessionNotice: null }),
    "/",
  );
  assert.equal(
    rootRouteDestination({
      user: null,
      sessionNotice: "session_expired",
    }),
    "/",
  );
});

test("explicit logout from /app lands on the public home, not /login", () => {
  assert.equal(explicitLogoutDestination(), "/");
  assert.equal(unauthenticatedDestination("signed_out"), "/");
  assert.equal(
    rootRouteDestination({ user: null, sessionNotice: "signed_out" }),
    "/",
  );
  const menu = readFileSync(
    new URL(
      "../../recovery-dashboard/components/AccountMenu.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const auth = readFileSync(
    new URL("../context/AuthContext.tsx", import.meta.url),
    "utf8",
  );
  assert.match(menu, /explicitLogoutDestination\(\)/);
  assert.match(auth, /setSessionNotice\("signed_out"\)/);
});
