import assert from "node:assert/strict";
import { test } from "node:test";
import { demoChanges } from "../demo-data.js";
import { resolveOrganCardIllustration } from "./resolve-organ-card-illustration.ts";

test("live hippocampus, testes and ovaries use their atlas plates", () => {
  assert.deepEqual(
    resolveOrganCardIllustration({ id: "brain-hippocampus", icon: "brain" }, true),
    { kind: "plate", src: "/images/anatomy/hippocampus.png" },
  );
  assert.deepEqual(resolveOrganCardIllustration({ id: "testes", icon: "brain" }, true), {
    kind: "plate",
    src: "/images/anatomy/testes.png",
  });
  assert.deepEqual(resolveOrganCardIllustration({ id: "ovaries", icon: "brain" }, true), {
    kind: "plate",
    src: "/images/anatomy/ovaries.png",
  });
});

test("live organ without a plate uses a placeholder, not another organ", () => {
  assert.deepEqual(resolveOrganCardIllustration({ id: "brain" }, true), {
    kind: "placeholder",
  });
});

test("unknown live id uses a placeholder", () => {
  assert.deepEqual(resolveOrganCardIllustration({ id: "not-an-organ" }, true), {
    kind: "placeholder",
  });
});

test("demo cards keep the original system glyph even when id matches an organ", () => {
  const dopamine = demoChanges.find((item) => item.id === "dopamine");
  const lungs = demoChanges.find((item) => item.id === "lungs");
  const heartRate = demoChanges.find((item) => item.id === "heart-rate");
  assert.ok(dopamine && lungs && heartRate);
  assert.deepEqual(resolveOrganCardIllustration(dopamine, false), {
    kind: "system-icon",
    name: "brain",
  });
  assert.deepEqual(resolveOrganCardIllustration(lungs, false), {
    kind: "system-icon",
    name: "lungs",
  });
  assert.deepEqual(resolveOrganCardIllustration(heartRate, false), {
    kind: "system-icon",
    name: "heart",
  });
});
