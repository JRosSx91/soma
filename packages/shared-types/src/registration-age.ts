/**
 * Age gate for registration. Soma stores only birth year on the account.
 * A civil date of birth is required at sign-up so a person who already
 * turned 18 this year can register, without accepting a minor who shares
 * that calendar year. The date is not persisted.
 *
 * "Today" is the civil date in Europe/Madrid (controller resident in Spain).
 * This is a declaration plus a date check, not documentary verification.
 */

export const MINIMUM_SERVICE_AGE_YEARS = 18;
export const REGISTRATION_AGE_TIME_ZONE = "Europe/Madrid";
export const EARLIEST_BIRTH_YEAR = 1900;

export type CivilDate = {
  year: number;
  month: number;
  day: number;
};

const ISO_CIVIL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function civilDateInTimeZone(
  instant: Date,
  timeZone: string = REGISTRATION_AGE_TIME_ZONE,
): CivilDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const lookup = (type: string): number => {
    const part = parts.find((entry) => entry.type === type);
    return Number(part?.value);
  };
  return {
    year: lookup("year"),
    month: lookup("month"),
    day: lookup("day"),
  };
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return leap ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

export function parseIsoCivilDate(value: string): CivilDate | null {
  const match = ISO_CIVIL_DATE.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function formatIsoCivilDate(date: CivilDate): string {
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  return `${date.year}-${month}-${day}`;
}

export function compareCivilDates(left: CivilDate, right: CivilDate): number {
  if (left.year !== right.year) return left.year - right.year;
  if (left.month !== right.month) return left.month - right.month;
  return left.day - right.day;
}

export function yearsElapsed(birth: CivilDate, on: CivilDate): number {
  let years = on.year - birth.year;
  if (on.month < birth.month || (on.month === birth.month && on.day < birth.day)) {
    years -= 1;
  }
  return years;
}

export function isAtLeastAge(
  birth: CivilDate,
  on: CivilDate,
  minYears: number = MINIMUM_SERVICE_AGE_YEARS,
): boolean {
  return yearsElapsed(birth, on) >= minYears;
}

/** Even a 31 December birth in this year is already `minYears` on `on`. */
export function isBirthYearDefinitelyAdult(
  birthYear: number,
  on: CivilDate,
  minYears: number = MINIMUM_SERVICE_AGE_YEARS,
): boolean {
  return isAtLeastAge({ year: birthYear, month: 12, day: 31 }, on, minYears);
}

/** A 1 January birth in this year is already `minYears` on `on`. */
export function isBirthYearPossiblyAdult(
  birthYear: number,
  on: CivilDate,
  minYears: number = MINIMUM_SERVICE_AGE_YEARS,
): boolean {
  return isAtLeastAge({ year: birthYear, month: 1, day: 1 }, on, minYears);
}

export type RegistrationAgeResult =
  | { ok: true; birthYear: number }
  | { ok: false; reason: "invalid" | "underage" };

export function evaluateRegistrationBirthDate(
  raw: string,
  instant: Date = new Date(),
  timeZone: string = REGISTRATION_AGE_TIME_ZONE,
): RegistrationAgeResult {
  const birth = parseIsoCivilDate(raw);
  if (!birth) return { ok: false, reason: "invalid" };
  if (birth.year < EARLIEST_BIRTH_YEAR) return { ok: false, reason: "invalid" };
  const today = civilDateInTimeZone(instant, timeZone);
  if (compareCivilDates(birth, today) > 0) return { ok: false, reason: "invalid" };
  if (!isAtLeastAge(birth, today)) return { ok: false, reason: "underage" };
  return { ok: true, birthYear: birth.year };
}

/**
 * Profile edits only store a year. An ambiguous year (some people already 18,
 * some not) may be kept if it was already verified at registration, but cannot
 * be newly chosen without a civil date.
 */
export function isStoredBirthYearAllowed(
  requestedYear: number,
  existingYear: number,
  instant: Date = new Date(),
  timeZone: string = REGISTRATION_AGE_TIME_ZONE,
): boolean {
  if (!Number.isInteger(requestedYear) || requestedYear < EARLIEST_BIRTH_YEAR) {
    return false;
  }
  const today = civilDateInTimeZone(instant, timeZone);
  if (requestedYear > today.year) return false;
  if (!isBirthYearPossiblyAdult(requestedYear, today)) return false;
  if (isBirthYearDefinitelyAdult(requestedYear, today)) return true;
  return requestedYear === existingYear;
}
