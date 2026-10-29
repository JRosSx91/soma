/**
 * GAM-01B: pure XP / level / title contracts.
 * No database client, HTTP, React, or abstinence clocks. The client must not award XP.
 *
 * Approved curve: T(L) = 30(L−1)² + 40(L−1) = 10(L−1)(3(L−1)+4).
 * Level is a function of total XP only.
 *
 * Title names behind i18n keys are provisional (GAM-01A). Product copy is not final.
 * `achievement_eligible` is a reserved source: GAM-01 does not grant XP for
 * declared-abstinence medals and does not classify medals here.
 */

export const PROGRESS_LEVEL_MIN = 1;
/** Inclusive cap so 10·n·(3n+4) stays inside MAX_SAFE_INTEGER. */
export const PROGRESS_LEVEL_MAX = 100_000;
export const PROGRESS_XP_MIN = 0;

export const PROGRESS_XP_SOURCES = [
  "journal_create_day",
  "personal_milestone",
  "onboarding_complete",
  "achievement_eligible",
  "mission_complete",
  "referral_qualified",
] as const;

export type ProgressXpSource = (typeof PROGRESS_XP_SOURCES)[number];

/** Amounts for sources that already have an approved figure. Others stay reserved. */
export const PROGRESS_XP_AMOUNT = {
  journal_create_day: 12,
  personal_milestone: 10,
  onboarding_complete: 30,
  achievement_eligible: 18,
  mission_complete: 12,
} as const satisfies Partial<Record<ProgressXpSource, number>>;

export const PROGRESS_TITLE_IDS = [
  "walker",
  "explorer",
  "cartographer",
  "naturalist",
  "researcher",
  "guide",
  "chronicler",
  "pathfinder",
  "expeditioner",
] as const;

export type ProgressTitleId = (typeof PROGRESS_TITLE_IDS)[number];

export interface ProgressTitle {
  id: ProgressTitleId;
  minLevel: number;
  /** i18n key under a future `progress` namespace. Copy is not final. */
  titleKey: `progress.titles.${ProgressTitleId}`;
  emblemId: ProgressTitleId;
}

export const PROGRESS_TITLES: readonly ProgressTitle[] = [
  { id: "walker", minLevel: 1, titleKey: "progress.titles.walker", emblemId: "walker" },
  { id: "explorer", minLevel: 5, titleKey: "progress.titles.explorer", emblemId: "explorer" },
  { id: "cartographer", minLevel: 10, titleKey: "progress.titles.cartographer", emblemId: "cartographer" },
  { id: "naturalist", minLevel: 15, titleKey: "progress.titles.naturalist", emblemId: "naturalist" },
  { id: "researcher", minLevel: 25, titleKey: "progress.titles.researcher", emblemId: "researcher" },
  { id: "guide", minLevel: 40, titleKey: "progress.titles.guide", emblemId: "guide" },
  { id: "chronicler", minLevel: 60, titleKey: "progress.titles.chronicler", emblemId: "chronicler" },
  { id: "pathfinder", minLevel: 80, titleKey: "progress.titles.pathfinder", emblemId: "pathfinder" },
  { id: "expeditioner", minLevel: 100, titleKey: "progress.titles.expeditioner", emblemId: "expeditioner" },
];

export const PROGRESS_STARTING_TITLE_ID: ProgressTitleId = "walker";

export interface ProgressBreakdown {
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  xpForNextLevel: number;
  percentToNextLevel: number;
  unlockedTitleIds: ProgressTitleId[];
}

function isSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && Number.isSafeInteger(value);
}

export function isProgressXp(value: unknown): value is number {
  return isSafeInteger(value) && value >= PROGRESS_XP_MIN && value <= PROGRESS_XP_MAX;
}

export function isProgressLevel(value: unknown): value is number {
  return (
    isSafeInteger(value) &&
    value >= PROGRESS_LEVEL_MIN &&
    value <= PROGRESS_LEVEL_MAX
  );
}

function requireProgressLevel(level: unknown, label: string): number {
  if (!isProgressLevel(level)) {
    throw new RangeError(`Invalid progress ${label}`);
  }
  return level;
}

function requireProgressXp(xp: unknown): number {
  if (!isProgressXp(xp)) {
    throw new RangeError("Invalid progress XP");
  }
  return xp;
}

/**
 * Cumulative XP required to *be* at `level` (start of the band).
 * T(1) = 0. Integer identity: 10·n·(3n+4) with n = L−1.
 */
export function totalXpToReach(level: number): number {
  const safe = requireProgressLevel(level, "level");
  const n = safe - 1;
  const total = 10 * n * (3 * n + 4);
  if (!Number.isSafeInteger(total) || total < PROGRESS_XP_MIN) {
    throw new RangeError("Invalid progress XP");
  }
  return total;
}

export const PROGRESS_XP_MAX = totalXpToReach(PROGRESS_LEVEL_MAX);

function bandXpForLevel(level: number): number {
  return 60 * level + 10;
}

/**
 * Highest level L such that T(L) <= xp. Binary search on integer T(L).
 * Does not use abstinence, clocks, or recovery curves.
 */
export function levelFromTotalXp(xp: number): number {
  const safe = requireProgressXp(xp);
  if (safe >= PROGRESS_XP_MAX) return PROGRESS_LEVEL_MAX;

  let lo = PROGRESS_LEVEL_MIN;
  let hi = PROGRESS_LEVEL_MAX;
  while (lo < hi) {
    const mid = lo + Math.ceil((hi - lo + 1) / 2);
    if (totalXpToReach(mid) <= safe) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function xpIntoCurrentLevel(xp: number): number {
  const safe = requireProgressXp(xp);
  const level = levelFromTotalXp(safe);
  return safe - totalXpToReach(level);
}

/** Remaining XP to the next level, or 0 at the cap. */
export function xpToNextLevel(xp: number): number {
  const safe = requireProgressXp(xp);
  const level = levelFromTotalXp(safe);
  if (level >= PROGRESS_LEVEL_MAX) return 0;
  return totalXpToReach(level + 1) - safe;
}

/** Width of the current band (T(L+1) − T(L)), or 0 at the cap. */
export function xpForNextLevel(xp: number): number {
  const safe = requireProgressXp(xp);
  const level = levelFromTotalXp(safe);
  if (level >= PROGRESS_LEVEL_MAX) return 0;
  return bandXpForLevel(level);
}

/**
 * 0–99 while inside a band (integer floor). 100 only at the level cap.
 * Exact threshold XP belongs to the new level, so percent is 0 there.
 */
export function percentToNextLevel(xp: number): number {
  const safe = requireProgressXp(xp);
  const level = levelFromTotalXp(safe);
  if (level >= PROGRESS_LEVEL_MAX) return 100;
  const band = bandXpForLevel(level);
  const into = safe - totalXpToReach(level);
  return Math.floor((into * 100) / band);
}

export function unlockedProgressTitles(level: number): ProgressTitle[] {
  const safe = requireProgressLevel(level, "level");
  return PROGRESS_TITLES.filter((row) => row.minLevel <= safe);
}

export function unlockedProgressTitleIds(level: number): ProgressTitleId[] {
  return unlockedProgressTitles(level).map((row) => row.id);
}

export function isProgressTitleUnlocked(
  titleId: ProgressTitleId,
  level: number,
): boolean {
  const row = PROGRESS_TITLES.find((item) => item.id === titleId);
  if (!row) return false;
  return row.minLevel <= requireProgressLevel(level, "level");
}

export function progressFromTotalXp(xp: number): ProgressBreakdown {
  const totalXp = requireProgressXp(xp);
  const level = levelFromTotalXp(totalXp);
  return {
    totalXp,
    level,
    xpIntoLevel: xpIntoCurrentLevel(totalXp),
    xpToNextLevel: xpToNextLevel(totalXp),
    xpForNextLevel: xpForNextLevel(totalXp),
    percentToNextLevel: percentToNextLevel(totalXp),
    unlockedTitleIds: unlockedProgressTitleIds(level),
  };
}

export function isProgressXpSource(value: string): value is ProgressXpSource {
  return (PROGRESS_XP_SOURCES as readonly string[]).includes(value);
}

export function isProgressTitleId(value: string): value is ProgressTitleId {
  return (PROGRESS_TITLE_IDS as readonly string[]).includes(value);
}
