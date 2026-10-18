import assert from "node:assert/strict";
import { test } from "node:test";
import { ForbiddenException } from "@nestjs/common";
import { AuthOriginGuard } from "./auth-origin.guard.js";

function ctx(headers: Record<string, string | undefined>) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as never;
}

test("allows an exact matching Origin", () => {
  process.env.CORS_ORIGIN = "http://localhost:5173";
  const guard = new AuthOriginGuard();
  assert.equal(
    guard.canActivate(ctx({ origin: "http://localhost:5173" })),
    true,
  );
});

test("rejects a foreign Origin", () => {
  process.env.CORS_ORIGIN = "http://localhost:5173";
  const guard = new AuthOriginGuard();
  assert.throws(
    () => guard.canActivate(ctx({ origin: "https://evil.example" })),
    ForbiddenException,
  );
});

test("rejects a foreign Origin even when X-Soma-Requested-With is set", () => {
  process.env.CORS_ORIGIN = "http://localhost:5173";
  const guard = new AuthOriginGuard();
  assert.throws(
    () =>
      guard.canActivate(
        ctx({
          origin: "https://evil.example",
          "x-soma-requested-with": "soma-web",
        }),
      ),
    ForbiddenException,
  );
});

test("custom header alone is never sufficient", () => {
  process.env.CORS_ORIGIN = "http://localhost:5173";
  const guard = new AuthOriginGuard();
  assert.throws(
    () =>
      guard.canActivate(
        ctx({
          "x-soma-requested-with": "soma-web",
        }),
      ),
    ForbiddenException,
  );
});

test("allows a Referer whose origin matches when Origin is absent", () => {
  process.env.CORS_ORIGIN = "http://localhost:5173";
  const guard = new AuthOriginGuard();
  assert.equal(
    guard.canActivate(
      ctx({ referer: "http://localhost:5173/app/recovery?x=1" }),
    ),
    true,
  );
});

test("rejects Referer prefix spoofing", () => {
  process.env.CORS_ORIGIN = "http://localhost:5173";
  const guard = new AuthOriginGuard();
  assert.throws(
    () =>
      guard.canActivate(
        ctx({ referer: "http://localhost:5173.evil.example/phish" }),
      ),
    ForbiddenException,
  );
});

test("rejects when both Origin and Referer are absent", () => {
  process.env.CORS_ORIGIN = "http://localhost:5173";
  const guard = new AuthOriginGuard();
  assert.throws(() => guard.canActivate(ctx({})), ForbiddenException);
});
