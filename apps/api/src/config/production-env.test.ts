import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import {
  ProductionConfigError,
  assertSecureProductionEnv,
  parseJwtExpiresDurationSeconds,
} from "./production-env.js";

const jwt = createRequire(import.meta.url)("jsonwebtoken") as {
  sign: (
    payload: object,
    secret: string,
    options: { expiresIn: string },
  ) => string;
  decode: (token: string) => { iat: number; exp: number };
};

const VALID_SECRET = "A".repeat(32);

function validProd(
  overrides: NodeJS.ProcessEnv = {},
): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "production",
    JWT_SECRET: VALID_SECRET,
    AUTH_REGISTRATION_MODE: "invite",
    CORS_ORIGIN: "https://app.example.com",
    JWT_EXPIRES_IN: "15m",
    ...overrides,
  };
}

function throwsConfig(env: NodeJS.ProcessEnv, pattern: RegExp): void {
  assert.throws(
    () => assertSecureProductionEnv(env),
    (err: unknown) => {
      assert.ok(err instanceof ProductionConfigError);
      assert.match(err.message, pattern);
      assert.equal(err.message.includes(VALID_SECRET), false);
      return true;
    },
  );
}

test("production accepts a complete secure configuration", () => {
  assert.doesNotThrow(() => assertSecureProductionEnv(validProd()));
  assert.doesNotThrow(() =>
    assertSecureProductionEnv(
      validProd({ AUTH_COOKIE_SECURE: "true", JWT_EXPIRES_IN: "1h" }),
    ),
  );
  assert.doesNotThrow(() =>
    assertSecureProductionEnv(validProd({ JWT_EXPIRES_IN: undefined })),
  );
  assert.doesNotThrow(() =>
    assertSecureProductionEnv(validProd({ JWT_EXPIRES_IN: "3600s" })),
  );
});

test("production rejects a missing JWT_SECRET", () => {
  throwsConfig(validProd({ JWT_SECRET: undefined }), /JWT_SECRET is required/);
  throwsConfig(validProd({ JWT_SECRET: "   " }), /JWT_SECRET is required/);
});

test("production rejects a JWT_SECRET shorter than 32 bytes", () => {
  throwsConfig(validProd({ JWT_SECRET: "a".repeat(31) }), /at least 32 bytes/);
});

test("production rejects placeholder JWT_SECRET values", () => {
  throwsConfig(
    validProd({ JWT_SECRET: "replace-with-a-long-random-secret" }),
    /placeholder/,
  );
  throwsConfig(validProd({ JWT_SECRET: "changeme" }), /placeholder/);
  throwsConfig(
    validProd({
      JWT_SECRET: "development_only_not_for_production_use_0001",
    }),
    /placeholder/,
  );
});

test("production accepts AUTH_REGISTRATION_MODE=open or invite", () => {
  assert.doesNotThrow(() =>
    assertSecureProductionEnv(validProd({ AUTH_REGISTRATION_MODE: "open" })),
  );
  assert.doesNotThrow(() =>
    assertSecureProductionEnv(validProd({ AUTH_REGISTRATION_MODE: "invite" })),
  );
});

test("production rejects unset AUTH_REGISTRATION_MODE", () => {
  throwsConfig(
    validProd({ AUTH_REGISTRATION_MODE: undefined }),
    /open" or "invite"/,
  );
});

test("production rejects unknown AUTH_REGISTRATION_MODE", () => {
  throwsConfig(
    validProd({ AUTH_REGISTRATION_MODE: "closed" }),
    /open" or "invite"/,
  );
});

test("production rejects missing CORS_ORIGIN", () => {
  throwsConfig(validProd({ CORS_ORIGIN: undefined }), /CORS_ORIGIN is required/);
});

test("production rejects HTTP CORS_ORIGIN", () => {
  throwsConfig(
    validProd({ CORS_ORIGIN: "http://localhost:5173" }),
    /https/,
  );
});

test("production rejects AUTH_COOKIE_SECURE=false", () => {
  throwsConfig(
    validProd({ AUTH_COOKIE_SECURE: "false" }),
    /AUTH_COOKIE_SECURE/,
  );
});

test("production rejects JWT_EXPIRES_IN longer than 1 hour", () => {
  throwsConfig(validProd({ JWT_EXPIRES_IN: "2h" }), /1 hour/);
  throwsConfig(validProd({ JWT_EXPIRES_IN: "61m" }), /1 hour/);
  throwsConfig(validProd({ JWT_EXPIRES_IN: "86400s" }), /1 hour/);
});

test("production rejects invalid JWT_EXPIRES_IN", () => {
  throwsConfig(validProd({ JWT_EXPIRES_IN: "abc" }), /invalid/);
  throwsConfig(validProd({ JWT_EXPIRES_IN: "15x" }), /invalid/);
  throwsConfig(validProd({ JWT_EXPIRES_IN: "-5m" }), /invalid/);
  throwsConfig(validProd({ JWT_EXPIRES_IN: "0s" }), /invalid/);
});

test("production rejects unitless numeric JWT_EXPIRES_IN as ambiguous", () => {
  throwsConfig(validProd({ JWT_EXPIRES_IN: "3600" }), /unit/);
  throwsConfig(validProd({ JWT_EXPIRES_IN: "900" }), /unit/);
});

test("parseJwtExpiresDurationSeconds matches jsonwebtoken string expiresIn", () => {
  assert.equal(parseJwtExpiresDurationSeconds("15m"), 15 * 60);
  assert.equal(parseJwtExpiresDurationSeconds("1h"), 3600);
  assert.equal(parseJwtExpiresDurationSeconds("3600s"), 3600);

  for (const expiresIn of ["15m", "1h", "3600s"] as const) {
    const token = jwt.sign({ sub: "t" }, "unit-test-secret", { expiresIn });
    const payload = jwt.decode(token) as { iat: number; exp: number };
    assert.equal(
      payload.exp - payload.iat,
      parseJwtExpiresDurationSeconds(expiresIn),
    );
  }

  const unitless = jwt.sign({ sub: "t" }, "unit-test-secret", {
    expiresIn: "3600",
  });
  const unitlessPayload = jwt.decode(unitless);
  const unitlessSeconds = unitlessPayload.exp - unitlessPayload.iat;
  assert.ok(unitlessSeconds <= 4);
  assert.notEqual(unitlessSeconds, 3600);
});

test("non-production leaves local defaults untouched", () => {
  assert.doesNotThrow(() => assertSecureProductionEnv({}));
  assert.doesNotThrow(() =>
    assertSecureProductionEnv({ NODE_ENV: "development" }),
  );
  assert.doesNotThrow(() =>
    assertSecureProductionEnv({
      NODE_ENV: "test",
      CORS_ORIGIN: "http://localhost:5173",
      AUTH_REGISTRATION_MODE: "open",
      JWT_SECRET: "short",
      AUTH_COOKIE_SECURE: "false",
      JWT_EXPIRES_IN: "7d",
    }),
  );
});
