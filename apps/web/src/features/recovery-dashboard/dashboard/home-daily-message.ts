/** Stable local-calendar day key. Same day always yields the same index. */
export function localDayIndex(now: Date): number {
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const utcDay = Math.floor(Date.UTC(year, month, day) / 86_400_000);
  return utcDay;
}

export function pickDailyMessage(
  messages: readonly string[],
  now: Date = new Date(),
  offset = 0,
): string | null {
  if (messages.length === 0) return null;
  const index =
    (((localDayIndex(now) + offset) % messages.length) + messages.length) % messages.length;
  return messages[index] ?? null;
}

export function readDailyMessages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}
