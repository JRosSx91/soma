import assert from "node:assert/strict";
import { test } from "node:test";
import { feedbackDuplicateKey } from "@soma/shared-types";
import { feedbackFingerprint } from "./feedback.hash.js";

test("fingerprint is sha256 hex of the shared duplicate key", () => {
  const hex = feedbackFingerprint(
    "suggestion",
    "  Dark  mode ",
    "Please add a dim theme option soon.",
  );
  assert.match(hex, /^[a-f0-9]{64}$/);
  assert.equal(
    hex,
    feedbackFingerprint(
      "suggestion",
      "dark mode",
      "Please add a dim theme option soon.",
    ),
  );
  assert.ok(
    feedbackDuplicateKey(
      "suggestion",
      "Dark mode",
      "Please add a dim theme option soon.",
    ).length > 0,
  );
});
