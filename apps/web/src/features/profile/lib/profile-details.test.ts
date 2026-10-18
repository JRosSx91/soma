import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildProfileDetailsPatch,
  draftFromProfile,
  parseWeightInput,
  type ProfileDetailsFields,
} from "./profile-details.js";

const baseline: ProfileDetailsFields = {
  displayName: "Ada",
  biologicalSex: "female",
  birthYear: 1990,
  weightKg: 70,
};

test("parseWeightInput accepts decimals with dot or comma", () => {
  assert.deepEqual(parseWeightInput("68.5"), { ok: true, value: 68.5 });
  assert.deepEqual(parseWeightInput("68,5"), { ok: true, value: 68.5 });
  assert.deepEqual(parseWeightInput("20"), { ok: true, value: 20 });
  assert.deepEqual(parseWeightInput("400"), { ok: true, value: 400 });
  assert.deepEqual(parseWeightInput(""), { ok: true, value: null });
  assert.deepEqual(parseWeightInput("  "), { ok: true, value: null });
});

test("parseWeightInput rejects invalid and out-of-range values", () => {
  assert.equal(parseWeightInput("abc").ok, false);
  assert.equal(parseWeightInput("68.5.1").ok, false);
  assert.equal(parseWeightInput("68,5.2").ok, false);
  assert.equal(parseWeightInput("19.99").ok, false);
  assert.equal(parseWeightInput("400.01").ok, false);
  assert.equal(parseWeightInput("Infinity").ok, false);
  assert.equal(parseWeightInput("NaN").ok, false);
});

test("buildProfileDetailsPatch sends only changed fields", () => {
  const result = buildProfileDetailsPatch(baseline, {
    ...draftFromProfile(baseline),
    displayName: "Ada Lovelace",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { displayName: "Ada Lovelace" });
  }
});

test("buildProfileDetailsPatch can change several fields including weight clear", () => {
  const result = buildProfileDetailsPatch(baseline, {
    displayName: "Ada",
    biologicalSex: "male",
    birthYear: "1988",
    weightKg: "",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, {
      biologicalSex: "male",
      birthYear: 1988,
      weightKg: null,
    });
  }
});

test("buildProfileDetailsPatch rejects empty PATCH (no changes)", () => {
  const result = buildProfileDetailsPatch(
    baseline,
    draftFromProfile(baseline),
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.errorKey, "errors.noChanges");
});

test("buildProfileDetailsPatch validates displayName and birthYear", () => {
  assert.equal(
    buildProfileDetailsPatch(baseline, {
      ...draftFromProfile(baseline),
      displayName: "  ",
    }).ok,
    false,
  );
  assert.equal(
    buildProfileDetailsPatch(baseline, {
      ...draftFromProfile(baseline),
      birthYear: "1800",
    }).ok,
    false,
  );
  assert.equal(
    buildProfileDetailsPatch(
      baseline,
      { ...draftFromProfile(baseline), birthYear: "1991" },
      1990,
    ).ok,
    false,
  );
});

test("buildProfileDetailsPatch sends numeric weight not a string", () => {
  const result = buildProfileDetailsPatch(baseline, {
    ...draftFromProfile(baseline),
    weightKg: "68,5",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(typeof result.patch.weightKg, "number");
    assert.equal(result.patch.weightKg, 68.5);
  }
});

test("draftFromProfile round-trips null weight as empty string", () => {
  const draft = draftFromProfile({ ...baseline, weightKg: null });
  assert.equal(draft.weightKg, "");
});
