import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CodedBadRequestException,
  CodedForbiddenException,
} from "../common/exceptions/coded-exception.js";
import { currentRegistrationAcceptanceFields } from "@soma/shared-types";
import { REGISTRATION_UNAVAILABLE_CODE } from "./registration-mode.js";
import {
  AUTH_ACCEPTANCE_REQUIRED_CODE,
  assertProductionAllowsRegistration,
  assertRegistrationAcceptance,
  persistRegistrationAcceptances,
} from "./registration-acceptance.js";

test("production refuses registration while legal notices are draft", () => {
  assert.throws(
    () =>
      assertProductionAllowsRegistration(
        { NODE_ENV: "production" },
        "draft",
      ),
    (err: unknown) => {
      assert.ok(err instanceof CodedForbiddenException);
      assert.equal(err.code, REGISTRATION_UNAVAILABLE_CODE);
      return true;
    },
  );
});

test("production allows registration only after legal notices are published", () => {
  assert.doesNotThrow(() =>
    assertProductionAllowsRegistration(
      { NODE_ENV: "production" },
      "published",
    ),
  );
});

test("development still allows registration against draft legal notices", () => {
  assert.doesNotThrow(() =>
    assertProductionAllowsRegistration({ NODE_ENV: "development" }, "draft"),
  );
  assert.doesNotThrow(() =>
    assertProductionAllowsRegistration({ NODE_ENV: "test" }, "draft"),
  );
});

test("assertRegistrationAcceptance rejects unchecked draft flags", () => {
  assert.throws(
    () =>
      assertRegistrationAcceptance({
        ...currentRegistrationAcceptanceFields(),
        acceptedPrivacyNotice: false,
      }),
    (err: unknown) => {
      assert.ok(err instanceof CodedBadRequestException);
      assert.equal(err.code, AUTH_ACCEPTANCE_REQUIRED_CODE);
      return true;
    },
  );
});

test("persistRegistrationAcceptances writes purpose, version, datetime only", async () => {
  const rows: unknown[] = [];
  await persistRegistrationAcceptances(
    {
      registrationAcceptance: {
        createMany: async ({ data }: { data: unknown[] }) => {
          rows.push(...data);
          return { count: data.length };
        },
      },
    } as never,
    "user-1",
    new Date("2026-10-30T09:00:00.000Z"),
  );
  assert.equal(rows.length, 3);
  for (const row of rows) {
    const record = row as Record<string, unknown>;
    assert.equal(record.userId, "user-1");
    assert.equal(typeof record.purpose, "string");
    assert.equal(String(record.documentVersion).startsWith("draft-"), true);
    assert.equal(
      (record.acceptedAt as Date).toISOString(),
      "2026-10-30T09:00:00.000Z",
    );
    assert.equal("ip" in record, false);
    assert.equal("ipHash" in record, false);
  }
});
