import { estimateCurve } from "@soma/shared-types";
import type { BodySystem, OrganId, SubstanceId } from "@soma/shared-types";
import type { ApiSubstance } from "../../substances/index.js";
import type { OrganState } from "../../profile/index.js";
import type { ProfileUsage, UserProfile } from "../../profile/types.js";
import type { UserProfileResponse } from "../../profile/hooks/useUserProfile.js";
import { computeRecovery } from "../../recovery-engine/calculator.ts";
import type {
  DemoChange,
  DemoOrganIcon,
  DemoSeries,
  DemoSubstance,
  DemoSystem,
} from "../demo-data.js";
import {
  fillRecoveryTemplate,
  SPANISH_RECOVERY_COPY,
  type RecoveryDashboardCopy,
} from "./recovery-copy.js";
import {
  formatLabeledPercent,
  formatTrajectoryPercent,
  isCalculableProgress,
  modelCeilingPercent,
} from "./recovery-semantics.js";

/**
 * Atlas `atlasSystems[].name` for BodySystems that stay off the tile/chart
 * surface (`SYSTEM_META` null). Keep in sync with atlas-config.ts.
 * teeth → integumentary was falling back to the generic «Órgano» card label.
 */
const ATLAS_CARD_SYSTEM_LABEL: Partial<Record<BodySystem, string>> = {
  integumentary: "Sistema tegumentario",
  reproductive: "Sistema reproductor",
};

/** Axis day marks used for the live chart. Same labels as the demo composition. */
export const LIVE_AXIS_DAYS = [0, 30, 90, 180, 365] as const;

export const LIVE_AXIS_LABELS = SPANISH_RECOVERY_COPY.axisLabels;

const SUBSTANCE_NAME_ES: Record<string, string> = {
  alcohol: "Alcohol",
  nicotine: "Nicotina",
  cannabis: "Cannabis",
  cocaine: "Cocaína",
  caffeine: "Cafeína",
};

const SYSTEM_META: Record<
  BodySystem,
  { id: string; name: string; icon: DemoOrganIcon; seriesColor: string } | null
> = {
  "nervous-central": {
    id: "nervous-central",
    name: "Sistema nervioso",
    icon: "brain",
    seriesColor: "rgb(var(--soma-physiology))",
  },
  "nervous-peripheral": {
    id: "nervous-peripheral",
    name: "Nervioso periférico",
    icon: "brain",
    seriesColor: "rgb(var(--soma-ink-secondary))",
  },
  cardiovascular: {
    id: "cardiovascular",
    name: "Cardiovascular",
    icon: "heart",
    seriesColor: "rgb(var(--soma-warning))",
  },
  respiratory: {
    id: "respiratory",
    name: "Respiratorio",
    icon: "lungs",
    seriesColor: "rgb(var(--soma-danger))",
  },
  digestive: {
    id: "digestive",
    name: "Digestivo",
    icon: "digestive",
    seriesColor: "rgb(var(--soma-action))",
  },
  hepatic: {
    id: "hepatic",
    name: "Hepático",
    icon: "digestive",
    seriesColor: "rgb(var(--soma-action))",
  },
  endocrine: {
    id: "endocrine",
    name: "Endocrino",
    icon: "endocrine",
    seriesColor: "rgb(var(--soma-physiology))",
  },
  immune: {
    id: "immune",
    name: "Inmunológico",
    icon: "immune",
    seriesColor: "rgb(var(--soma-ink-secondary))",
  },
  renal: null,
  reproductive: null,
  integumentary: null,
  sensory: null,
};

/** Prisma enums use underscores; shared-types / atlas use hyphens. */
function normalizeSystem(system: string): BodySystem | null {
  const normalized = system.replaceAll("_", "-") as BodySystem;
  return Object.hasOwn(SYSTEM_META, normalized) ? normalized : null;
}

export interface LiveChartModel {
  axisLabels: readonly string[];
  todayPosition: number;
  todayLabel: string;
  /** False when an overlay would imply a single shared abstinence “now”. */
  showToday: boolean;
  series: readonly DemoSeries[];
  footnote: string;
}

export interface LiveDashboardModel {
  substances: DemoSubstance[];
  systems: DemoSystem[];
  /** Factual organ progress cards — not educational narratives. */
  changes: DemoChange[];
  chart: LiveChartModel;
  /** Organ id → system id for filtering recovery tabs. */
  organSystemById: ReadonlyMap<OrganId, BodySystem>;
  /** Substance id → organ ids it affects for the user. */
  organsBySubstance: ReadonlyMap<string, readonly OrganId[]>;
}

export function adaptServerProfile(response: UserProfileResponse): UserProfile {
  return {
    displayName: response.user.displayName,
    biologicalSex: response.user.biologicalSex,
    birthYear: response.user.birthYear,
    weightKg: response.user.weightKg ?? undefined,
    usages: response.usages.map((usage) => ({
      substanceId: usage.substanceId as SubstanceId,
      yearStarted: usage.yearStarted,
      lastUseDate: usage.lastUseDate,
      frequency: usage.frequency,
      status: usage.status,
    })),
  };
}

export function substanceDisplayName(id: string): string {
  return SUBSTANCE_NAME_ES[id] ?? id;
}

export function formatDaysAbstinent(
  days: number,
  copy: RecoveryDashboardCopy = SPANISH_RECOVERY_COPY,
): string {
  const whole = Math.floor(Math.max(0, days));
  if (whole === 1) return copy.dayOne;
  return fillRecoveryTemplate(copy.daysMany, { count: whole });
}

function elapsedDaysSince(lastUseDate: string, now: number): number | null {
  const start = Date.parse(lastUseDate);
  if (!Number.isFinite(start)) return null;
  return Math.max(0, (now - start) / 86_400_000);
}

/** Maps abstinence days onto the five-mark composition axis (0…1). */
export function todayPositionOnAxis(daysAbstinent: number): number {
  const marks = LIVE_AXIS_DAYS;
  if (daysAbstinent <= 0) return 0;
  const last = marks[marks.length - 1] ?? 365;
  if (daysAbstinent >= last) return 1;
  for (let index = 0; index < marks.length - 1; index += 1) {
    const start = marks[index] ?? 0;
    const end = marks[index + 1] ?? last;
    if (daysAbstinent <= end) {
      const span = end - start || 1;
      const t = (daysAbstinent - start) / span;
      return (index + t) / (marks.length - 1);
    }
  }
  return 1;
}

export type TrajectoryAvailability =
  | "ready"
  | "active"
  | "missing-date"
  | "no-curves"
  | "unavailable";

export interface SubstanceProgressResult {
  /** curveProgress — primary UI percentage. Null when not calculable. */
  progressFraction: number | null;
  /** curveProgress × recoveryCeiling for the dominating curve. */
  absoluteRecovery: number | null;
  /** Ceiling of the dominating (worst progress) curve; null if unknown. */
  recoveryCeiling: number | null;
  daysAbstinent: number;
  confidenceLevel: string | null;
  availability: TrajectoryAvailability;
}

function emptyProgress(
  availability: TrajectoryAvailability,
  daysAbstinent = 0,
): SubstanceProgressResult {
  return {
    progressFraction: availability === "active" ? 0 : null,
    absoluteRecovery: availability === "active" ? 0 : null,
    recoveryCeiling: null,
    daysAbstinent,
    confidenceLevel: null,
    availability,
  };
}

/**
 * Worst (lowest) progressFraction for a substance across its recovery curves.
 * Active use is a valid 0. Missing dates / no curves / invalid values are not.
 * Display still uses progressFraction; absoluteRecovery is contextual only.
 */
export function substanceProgress(
  usage: ProfileUsage,
  substance: ApiSubstance | undefined,
  now: number,
): SubstanceProgressResult {
  if (!substance) return emptyProgress("unavailable");
  if (usage.status === "active") return emptyProgress("active");
  if (!usage.lastUseDate) return emptyProgress("missing-date");
  const elapsed = elapsedDaysSince(usage.lastUseDate, now);
  if (elapsed == null) return emptyProgress("unavailable");
  if (substance.recoveryCurves.length === 0) {
    return emptyProgress("no-curves", elapsed);
  }

  let worst = 1;
  let worstAbsolute = 1;
  let worstCeiling: number | null = null;
  let daysAbstinent = elapsed;
  let confidence: string | null = null;
  let sawFinite = false;

  for (const curve of substance.recoveryCurves) {
    const recovery = computeRecovery(
      {
        shape: curve.shape,
        daysTo95Recovery: curve.daysTo95Recovery,
        recoveryCeiling: curve.recoveryCeiling,
        lastUseDate: usage.lastUseDate,
      },
      now,
    );
    daysAbstinent = recovery.daysAbstinent;
    if (!isCalculableProgress(recovery.progressFraction)) continue;
    sawFinite = true;
    if (recovery.progressFraction <= worst) {
      worst = recovery.progressFraction;
      worstAbsolute = isCalculableProgress(recovery.absoluteRecovery)
        ? recovery.absoluteRecovery
        : recovery.progressFraction;
      worstCeiling = curve.recoveryCeiling;
      confidence = curve.confidenceLevel;
    }
  }

  if (!sawFinite) return emptyProgress("unavailable", daysAbstinent);

  return {
    progressFraction: worst,
    absoluteRecovery: worstAbsolute,
    recoveryCeiling: worstCeiling,
    daysAbstinent,
    confidenceLevel: confidence,
    availability: "ready",
  };
}

function sampleCurveProgress(
  shape: ApiSubstance["recoveryCurves"][number]["shape"],
  daysTo95Recovery: number,
  recoveryCeiling: number,
  daysAbstinent: number,
): number {
  return estimateCurve(daysAbstinent, {
    shape,
    daysTo95Recovery,
    recoveryCeiling,
  }).curveProgress;
}

function worstCurveProgressAtDay(
  curves: readonly {
    shape: ApiSubstance["recoveryCurves"][number]["shape"];
    daysTo95Recovery: number;
    recoveryCeiling: number;
  }[],
  day: number,
): number {
  let worst = 1;
  for (const curve of curves) {
    const value = sampleCurveProgress(
      curve.shape,
      curve.daysTo95Recovery,
      curve.recoveryCeiling,
      day,
    );
    if (value < worst) worst = value;
  }
  return curves.length === 0 ? 0 : worst;
}

/**
 * Builds the live chart from canonical curves only.
 * Axis samples are model checkpoints at fixed day marks (projection).
 * Legend `endLabel` is today’s trajectory advance (elapsed abstinence days),
 * not the day-365 sample. `referenceAtYearLabel` keeps the day-365 checkpoint.
 * Multi-substance overlays omit Today labels; they would share one elapsed-day
 * reference that is not each substance’s real abstinence.
 */
export function buildLiveChart(input: {
  usages: readonly ProfileUsage[];
  substances: readonly ApiSubstance[];
  substanceId: string | null;
  now: number;
  copy?: RecoveryDashboardCopy;
}): LiveChartModel {
  const copy = input.copy ?? SPANISH_RECOVERY_COPY;
  const substancesById = new Map(input.substances.map((item) => [item.id, item]));
  const usages = input.substanceId
    ? input.usages.filter((usage) => usage.substanceId === input.substanceId)
    : input.usages;

  type CurveRef = {
    system: BodySystem;
    shape: ApiSubstance["recoveryCurves"][number]["shape"];
    daysTo95Recovery: number;
    recoveryCeiling: number;
  };

  const curvesBySystem = new Map<BodySystem, CurveRef[]>();
  let referenceDays = 0;
  let referenceName = "";

  for (const usage of usages) {
    const substance = substancesById.get(usage.substanceId);
    if (!substance) continue;
    const progress = substanceProgress(usage, substance, input.now);
    if (usage.status === "abstinent" && usage.lastUseDate && progress.daysAbstinent >= referenceDays) {
      referenceDays = progress.daysAbstinent;
      referenceName = substanceDisplayName(usage.substanceId);
    }
    if (usage.status === "active" || !usage.lastUseDate) continue;

    for (const curve of substance.recoveryCurves) {
      const system = normalizeSystem(curve.organ.system);
      if (!system || !SYSTEM_META[system]) continue;
      const list = curvesBySystem.get(system) ?? [];
      list.push({
        system,
        shape: curve.shape,
        daysTo95Recovery: curve.daysTo95Recovery,
        recoveryCeiling: curve.recoveryCeiling,
      });
      curvesBySystem.set(system, list);
    }
  }

  const overlaySubstanceCount = new Set(usages.map((usage) => usage.substanceId)).size;
  const showToday = Boolean(input.substanceId) || overlaySubstanceCount <= 1;

  const series: DemoSeries[] = [];
  for (const [system, curves] of curvesBySystem) {
    const meta = SYSTEM_META[system];
    if (!meta || curves.length === 0) continue;

    const samples = LIVE_AXIS_DAYS.map((day) =>
      worstCurveProgressAtDay(curves, day),
    );
    const yearProgress = samples[samples.length - 1] ?? 0;
    const todayProgress = showToday
      ? worstCurveProgressAtDay(curves, referenceDays)
      : null;

    series.push({
      id: meta.id,
      label: meta.name,
      samples,
      endLabel:
        todayProgress != null
          ? formatLabeledPercent(copy.today, todayProgress)
          : "",
      referenceAtYearLabel: formatLabeledPercent(copy.day365, yearProgress),
      color: meta.seriesColor,
    });
  }

  series.sort((a, b) => a.label.localeCompare(b.label, "es"));

  const todayLabel = !showToday
    ? ""
    : referenceDays > 0
      ? referenceName
        ? fillRecoveryTemplate(copy.todayWithDaysAndName, {
            today: copy.today,
            days: formatDaysAbstinent(referenceDays, copy),
            name: referenceName,
          })
        : fillRecoveryTemplate(copy.todayWithDays, {
            today: copy.today,
            days: formatDaysAbstinent(referenceDays, copy),
          })
      : copy.today;

  return {
    axisLabels: copy.axisLabels,
    todayPosition: todayPositionOnAxis(referenceDays),
    todayLabel,
    showToday,
    series,
    footnote: showToday ? copy.liveFootnote : copy.liveFootnoteOverlay,
  };
}

/** Prefer a translated label; never surface the raw organ id. */
export function localizedOrganName(
  organId: string,
  fallback: string,
  translated: string | undefined,
): string {
  if (translated == null || translated === "" || translated === organId) {
    return fallback;
  }
  return translated;
}

export function buildLiveDashboard(input: {
  usages: readonly ProfileUsage[];
  substances: readonly ApiSubstance[];
  organStates: ReadonlyMap<OrganId, OrganState>;
  substanceId: string | null;
  now?: number;
  copy?: RecoveryDashboardCopy;
  /** Display name for an organ id. Catalog `organName` remains the fallback. */
  organLabel?: (organId: string, fallback: string) => string;
}): LiveDashboardModel {
  const now = input.now ?? Date.now();
  const copy = input.copy ?? SPANISH_RECOVERY_COPY;
  const substancesById = new Map(input.substances.map((item) => [item.id, item]));
  const organSystemById = new Map<OrganId, BodySystem>();
  const organsBySubstance = new Map<string, OrganId[]>();

  for (const substance of input.substances) {
    const organIds: OrganId[] = [];
    for (const curve of substance.recoveryCurves) {
      const system = normalizeSystem(curve.organ.system);
      if (system) organSystemById.set(curve.organId, system);
      organIds.push(curve.organId);
    }
    organsBySubstance.set(substance.id, organIds);
  }

  const substances: DemoSubstance[] = input.usages.map((usage) => {
    const substance = substancesById.get(usage.substanceId);
    const name = substanceDisplayName(usage.substanceId);
    const progress = substanceProgress(usage, substance, now);

    if (progress.availability === "active") {
      return {
        id: usage.substanceId,
        name,
        abstinence: copy.activeShort,
        pillDetail: fillRecoveryTemplate(copy.pillActive, {
          name: name.toLowerCase(),
        }),
        phase: copy.phaseActive,
        bar: 0,
        lastUseDate: usage.lastUseDate ?? null,
      };
    }

    if (progress.availability === "missing-date") {
      return {
        id: usage.substanceId,
        name,
        abstinence: copy.unavailable,
        pillDetail: fillRecoveryTemplate(copy.pillMissingDate, { name }),
        phase: copy.phaseMissingDate,
        bar: 0,
        lastUseDate: usage.lastUseDate ?? null,
      };
    }

    if (progress.availability === "no-curves") {
      const daysLabel = formatDaysAbstinent(progress.daysAbstinent, copy);
      return {
        id: usage.substanceId,
        name,
        abstinence: daysLabel,
        pillDetail: fillRecoveryTemplate(copy.pillAbstinent, {
          days: daysLabel,
          name: name.toLowerCase(),
        }),
        phase: copy.phaseNoCurves,
        bar: 0,
        lastUseDate: usage.lastUseDate ?? null,
      };
    }

    if (
      progress.availability !== "ready" ||
      !isCalculableProgress(progress.progressFraction)
    ) {
      return {
        id: usage.substanceId,
        name,
        abstinence: copy.unavailable,
        pillDetail: fillRecoveryTemplate(copy.pillMissingDate, { name }),
        phase: copy.phaseMissingDate,
        bar: 0,
        lastUseDate: usage.lastUseDate ?? null,
      };
    }

    const daysLabel = formatDaysAbstinent(progress.daysAbstinent, copy);
    const confidence =
      progress.confidenceLevel === "high"
        ? copy.confidenceHigh
        : progress.confidenceLevel === "medium"
          ? copy.confidenceMedium
          : progress.confidenceLevel === "low"
            ? copy.confidenceLow
            : null;
    const ceilingPct = modelCeilingPercent(progress.recoveryCeiling);
    const phase =
      ceilingPct != null && confidence
        ? fillRecoveryTemplate(copy.substancePhaseCeilingConfidence, {
            percent: ceilingPct,
            confidence,
          })
        : ceilingPct != null
          ? fillRecoveryTemplate(copy.substancePhaseCeiling, {
              percent: ceilingPct,
            })
          : confidence
            ? fillRecoveryTemplate(copy.substancePhaseConfidence, {
                confidence,
              })
            : copy.substancePhaseDefault;

    return {
      id: usage.substanceId,
      name,
      abstinence: daysLabel,
      pillDetail: fillRecoveryTemplate(copy.pillAbstinent, {
        days: daysLabel,
        name: name.toLowerCase(),
      }),
      phase,
      bar: progress.progressFraction,
      lastUseDate: usage.lastUseDate ?? null,
    };
  });

  const usageBySubstance = new Map(
    input.usages.map((usage) => [usage.substanceId, usage] as const),
  );

  /** Progress attributable to one substance on an organ (not the multi-substance worst). */
  function contributionFor(
    state: OrganState,
    substanceId: string | null,
  ): {
    progressFraction: number;
    daysAbstinent: number;
    status: "abstinent" | "active";
    substanceId: string;
  } | null {
    if (!substanceId) {
      return {
        progressFraction: state.progressFraction,
        daysAbstinent: state.daysAbstinent,
        status: state.dominantStatus,
        substanceId: state.dominantSubstanceId,
      };
    }
    const contrib = state.contributingSubstances.find(
      (item) => item.substanceId === substanceId,
    );
    if (!contrib) return null;
    const keyed = substanceId as SubstanceId;
    const usage = usageBySubstance.get(keyed);
    const substance = substancesById.get(keyed);
    const progress = usage
      ? substanceProgress(usage, substance, now)
      : { daysAbstinent: 0 };
    return {
      progressFraction: contrib.progressFraction,
      daysAbstinent: progress.daysAbstinent,
      status: contrib.status,
      substanceId,
    };
  }

  const systemWorst = new Map<BodySystem, number>();
  for (const state of input.organStates.values()) {
    const system = organSystemById.get(state.organId);
    if (!system || !SYSTEM_META[system]) continue;
    const contrib = contributionFor(state, input.substanceId);
    if (!contrib) continue;
    const previous = systemWorst.get(system);
    if (previous === undefined || contrib.progressFraction < previous) {
      systemWorst.set(system, contrib.progressFraction);
    }
  }

  const systems: DemoSystem[] = [...systemWorst.entries()]
    .map(([system, progress]) => {
      const meta = SYSTEM_META[system];
      if (!meta) return null;
      return {
        id: meta.id,
        name: meta.name,
        endLabel: formatTrajectoryPercent(progress),
        icon: meta.icon,
      };
    })
    .filter((item): item is DemoSystem => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  const organEntries = [...input.organStates.values()]
    .map((state) => {
      const contrib = contributionFor(state, input.substanceId);
      if (!contrib) return null;
      return { state, contrib };
    })
    .filter(
      (entry): entry is { state: OrganState; contrib: NonNullable<ReturnType<typeof contributionFor>> } =>
        entry !== null,
    )
    .sort((a, b) => a.contrib.progressFraction - b.contrib.progressFraction)
    .slice(0, 3);

  const changes: DemoChange[] = organEntries.map(({ state, contrib }) => {
    const system = organSystemById.get(state.organId);
    const meta = system ? SYSTEM_META[system] : null;
    const status =
      contrib.status === "active" ? copy.statusActive : copy.statusRecovering;
    const pct = formatTrajectoryPercent(contrib.progressFraction);
    const organName = localizedOrganName(
      state.organId,
      state.organName,
      input.organLabel?.(state.organId, state.organName),
    );
    const body =
      contrib.status === "active"
        ? fillRecoveryTemplate(copy.organBodyActive, {
            organ: organName,
          })
        : fillRecoveryTemplate(copy.organBodyAbstinent, {
            organ: organName,
            percent: pct,
            days: formatDaysAbstinent(contrib.daysAbstinent, copy),
            substance: substanceDisplayName(contrib.substanceId).toLowerCase(),
          });

    return {
      id: state.organId,
      system:
        meta?.name ??
        (system ? ATLAS_CARD_SYSTEM_LABEL[system] : undefined) ??
        copy.organFallback,
      title: organName,
      status,
      body,
      endLabel: pct,
    };
  });

  return {
    substances,
    systems,
    changes,
    chart: buildLiveChart({
      usages: input.usages,
      substances: input.substances,
      substanceId: input.substanceId,
      now,
      copy,
    }),
    organSystemById,
    organsBySubstance,
  };
}
