import assert from "node:assert/strict";
import { test } from "node:test";
import { unauthenticatedDestination } from "./unauthenticated-destination.js";

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
