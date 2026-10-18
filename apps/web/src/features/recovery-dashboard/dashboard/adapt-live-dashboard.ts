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

/**
 * Atlas `atlasSystems[].name` for BodySystems that stay off the tile/chart
 * surface (`SYSTEM_META` null). Keep in sync with atlas-config.ts.
 * teeth → integumentary was falling back to the generic «Órgano» card label.
 */
const ATLAS_CARD_SYSTEM_LABEL: Partial<Record<BodySystem, string>> = {
  integumentary: "Sistema tegumentario",
};

/** Axis day marks used for the live chart. Same labels as the demo composition. */
export const LIVE_AXIS_DAYS = [0, 30, 90, 180, 365] as const;

export const LIVE_AXIS_LABELS = [
  "Inicio",
  "1 mes",
  "3 meses",
  "6 meses",
  "1 año",
] as const;

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

export function formatDaysAbstinent(days: number): string {
  const whole = Math.floor(Math.max(0, days));
  if (whole === 1) return "1 día";
  return `${whole} días`;
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

/**
 * Worst (lowest) progress for a substance across its recovery curves.
 * Active use and missing dates yield 0 progress.
 */
export function substanceProgress(
  usage: ProfileUsage,
  substance: ApiSubstance | undefined,
  now: number,
): { progressFraction: number; daysAbstinent: number; confidenceLevel: string | null } {
  if (!substance) {
    return { progressFraction: 0, daysAbstinent: 0, confidenceLevel: null };
  }
  if (usage.status === "active" || !usage.lastUseDate) {
    return { progressFraction: 0, daysAbstinent: 0, confidenceLevel: null };
  }

  let worst = 1;
  let daysAbstinent = 0;
  let confidence: string | null = null;

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
    if (recovery.progressFraction <= worst) {
      worst = recovery.progressFraction;
      confidence = curve.confidenceLevel;
    }
  }

  if (substance.recoveryCurves.length === 0) {
    return { progressFraction: 0, daysAbstinent: 0, confidenceLevel: null };
  }

  return {
    progressFraction: worst,
    daysAbstinent,
    confidenceLevel: confidence,
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

/**
 * Builds the live chart from canonical curves only.
 * Each series is a body system; samples are estimateCurve at fixed day marks.
 * When `substanceId` is set, only that substance's curves contribute.
 */
export function buildLiveChart(input: {
  usages: readonly ProfileUsage[];
  substances: readonly ApiSubstance[];
  substanceId: string | null;
  now: number;
}): LiveChartModel {
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

  const series: DemoSeries[] = [];
  for (const [system, curves] of curvesBySystem) {
    const meta = SYSTEM_META[system];
    if (!meta || curves.length === 0) continue;

    const samples = LIVE_AXIS_DAYS.map((day) => {
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
      return worst;
    });

    const end = samples[samples.length - 1] ?? 0;
    series.push({
      id: meta.id,
      label: meta.name,
      samples,
      endLabel: `${Math.round(end * 100)}%`,
      color: meta.seriesColor,
    });
  }

  series.sort((a, b) => a.label.localeCompare(b.label, "es"));

  return {
    axisLabels: LIVE_AXIS_LABELS,
    todayPosition: todayPositionOnAxis(referenceDays),
    todayLabel:
      referenceDays > 0
        ? `Hoy · ${formatDaysAbstinent(referenceDays)}${referenceName ? ` · ${referenceName}` : ""}`
        : "Hoy",
    series,
    footnote:
      "Estimación orientativa a partir de las curvas del catálogo Soma. No es una medición clínica.",
  };
}

export function buildLiveDashboard(input: {
  usages: readonly ProfileUsage[];
  substances: readonly ApiSubstance[];
  organStates: ReadonlyMap<OrganId, OrganState>;
  substanceId: string | null;
  now?: number;
}): LiveDashboardModel {
  const now = input.now ?? Date.now();
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

    if (usage.status === "active") {
      return {
        id: usage.substanceId,
        name,
        abstinence: "Activo",
        pillDetail: `Consumo activo de ${name.toLowerCase()}`,
        phase: "Consumo activo. La recuperación no avanza mientras el consumo continúa.",
        bar: 0,
      };
    }

    if (!usage.lastUseDate) {
      return {
        id: usage.substanceId,
        name,
        abstinence: "—",
        pillDetail: `${name}: fecha de último consumo ausente`,
        phase: "Falta la fecha de la última vez, así que no se puede calcular el avance.",
        bar: 0,
      };
    }

    const daysLabel = formatDaysAbstinent(progress.daysAbstinent);
    const confidence =
      progress.confidenceLevel === "high"
        ? "alta"
        : progress.confidenceLevel === "medium"
          ? "media"
          : progress.confidenceLevel === "low"
            ? "baja"
            : null;

    return {
      id: usage.substanceId,
      name,
      abstinence: daysLabel,
      pillDetail: `${daysLabel} sin ${name.toLowerCase()}`,
      phase: confidence
        ? `Estimación de recuperación · confianza ${confidence}`
        : "Estimación de recuperación según el catálogo Soma",
      bar: progress.progressFraction,
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
      : { progressFraction: contrib.progressFraction, daysAbstinent: 0, confidenceLevel: null };
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
        endLabel: `${Math.round(progress * 100)}%`,
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
    const status = contrib.status === "active" ? "Consumo activo" : "En recuperación";
    const body =
      contrib.status === "active"
        ? `${state.organName}: el consumo activo mantiene el avance en 0 % para esta estimación.`
        : `${state.organName}: avance estimado ${Math.round(contrib.progressFraction * 100)} % tras ${formatDaysAbstinent(contrib.daysAbstinent)} sin ${substanceDisplayName(contrib.substanceId).toLowerCase()}.`;

    return {
      id: state.organId,
      system:
        meta?.name ??
        (system ? ATLAS_CARD_SYSTEM_LABEL[system] : undefined) ??
        "Órgano",
      title: state.organName,
      status,
      body,
      endLabel: `${Math.round(contrib.progressFraction * 100)}%`,
      icon: meta?.icon ?? "brain",
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
    }),
    organSystemById,
    organsBySubstance,
  };
}
