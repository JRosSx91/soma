import assert from "node:assert/strict";
import { test } from "node:test";
import {
  compareCivilDates,
  evaluateRegistrationBirthDate,
  isAtLeastAge,
  isBirthYearDefinitelyAdult,
  isBirthYearPossiblyAdult,
  isStoredBirthYearAllowed,
  parseIsoCivilDate,
  yearsElapsed,
} from "./registration-age.js";

const on31Oct2026 = new Date("2026-10-31T12:00:00.000Z");

test("civil date parser rejects non-dates and 31 February", () => {
  assert.equal(parseIsoCivilDate("1990-06-15")?.year, 1990);
  assert.equal(parseIsoCivilDate("1990-6-15"), null);
  assert.equal(parseIsoCivilDate("2026-02-30"), null);
  assert.equal(parseIsoCivilDate("2008-02-29")?.day, 29);
  assert.equal(parseIsoCivilDate("2009-02-29"), null);
});

test("age uses completed birthdays, not shared calendar year", () => {
  const today = { year: 2026, month: 10, day: 31 };
  assert.equal(yearsElapsed({ year: 2008, month: 10, day: 31 }, today), 18);
  assert.equal(isAtLeastAge({ year: 2008, month: 10, day: 31 }, today), true);
  assert.equal(isAtLeastAge({ year: 2008, month: 11, day: 1 }, today), false);
  assert.equal(isAtLeastAge({ year: 2007, month: 12, day: 31 }, today), true);
  assert.equal(isBirthYearDefinitelyAdult(2007, today), true);
  assert.equal(isBirthYearDefinitelyAdult(2008, today), false);
  assert.equal(isBirthYearPossiblyAdult(2008, today), true);
  assert.equal(isBirthYearPossiblyAdult(2009, today), false);
});

test("registration allows an 18th birthday today and rejects the next day", () => {
  const ok = evaluateRegistrationBirthDate("2008-10-31", on31Oct2026);
  assert.deepEqual(ok, { ok: true, birthYear: 2008 });
  assert.deepEqual(evaluateRegistrationBirthDate("2008-11-01", on31Oct2026), {
    ok: false,
    reason: "underage",
  });
  assert.equal(
    evaluateRegistrationBirthDate("2027-01-01", on31Oct2026).reason,
    "invalid",
  );
  assert.equal(evaluateRegistrationBirthDate("1899-12-31", on31Oct2026).reason, "invalid");
});

test("stored birth year cannot newly pick an ambiguous adult year", () => {
  assert.equal(isStoredBirthYearAllowed(1990, 1990, on31Oct2026), true);
  assert.equal(isStoredBirthYearAllowed(2007, 1990, on31Oct2026), true);
  assert.equal(isStoredBirthYearAllowed(2008, 1990, on31Oct2026), false);
  assert.equal(isStoredBirthYearAllowed(2008, 2008, on31Oct2026), true);
  assert.equal(isStoredBirthYearAllowed(2009, 1990, on31Oct2026), false);
  assert.equal(compareCivilDates({ year: 2026, month: 1, day: 1 }, { year: 2026, month: 1, day: 2 }) < 0, true);
});
