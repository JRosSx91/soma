const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export type RemainingTimeParts =
  | { kind: "lt_minute" }
  | { kind: "minutes"; minutes: number }
  | { kind: "hours"; hours: number; minutes: number }
  | { kind: "days"; days: number; hours: number };

export function remainingTimeParts(ms: number): RemainingTimeParts {
  const remaining = Math.max(0, Math.floor(ms));
  if (remaining < MS_PER_MINUTE) return { kind: "lt_minute" };

  const days = Math.floor(remaining / MS_PER_DAY);
  const hours = Math.floor((remaining % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((remaining % MS_PER_HOUR) / MS_PER_MINUTE);

  if (days > 0) return { kind: "days", days, hours };
  if (hours > 0) return { kind: "hours", hours, minutes };
  return { kind: "minutes", minutes };
}

export function remainingProgressPercent(progress: number): number {
  if (!Number.isFinite(progress) || progress <= 0) return 0;
  if (progress >= 1) return 100;
  return Math.max(0, Math.floor(progress * 100));
}
