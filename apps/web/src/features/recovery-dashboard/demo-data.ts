/**
 * Visual stand-in for the Soma 2.0 mockup.
 * Every figure here is fictional. Nothing in this file is read from
 * the recovery engine, the API, or a user profile.
 */

import { shellSections, type ShellSectionId } from "./shell-base.js";

export const demoDisclaimer =
  "Cifras y textos ficticios. No son mediciones clínicas.";

/** Public DEMO section links. Prefer `shellSections(base)` for shell navigation. */
export const previewSections = shellSections("/preview");

export type PreviewSectionId = ShellSectionId;

export interface DemoSubstance {
  id: string;
  name: string;
  /** Copy shown large on the card, as in the mockup. */
  abstinence: string;
  /** Phrase used in the header pill: "42 días sin cannabis". */
  pillDetail: string;
  phase: string;
  /** Length of the decorative bar, 0–1. Not a recovery fraction. */
  bar: number;
  /** ISO last-use date when known. Display only; days come from `abstinence`. */
  lastUseDate?: string | null;
  /** Live usage row. Demo defaults to abstinent when omitted. */
  usageStatus?: "abstinent" | "active";
  /** Demo-only elapsed 24h days used to seed a session last-use clock. */
  elapsedDays?: number;
}

export const demoSubstances: readonly DemoSubstance[] = [
  {
    id: "cannabis",
    name: "Cannabis",
    abstinence: "42 días",
    pillDetail: "42 días sin cannabis",
    phase: "Fase de normalización de neurotransmisores",
    bar: 0.46,
    usageStatus: "abstinent",
    elapsedDays: 42,
  },
  {
    id: "nicotine",
    name: "Nicotina",
    abstinence: "15 días",
    pillDetail: "15 días sin nicotina",
    phase: "Mejora de la función cardiovascular",
    bar: 0.28,
    usageStatus: "abstinent",
    elapsedDays: 15,
  },
  {
    id: "cocaine",
    name: "Cocaína",
    abstinence: "4 meses",
    pillDetail: "4 meses sin cocaína",
    phase: "Estabilización de circuitos de recompensa",
    bar: 0.62,
    usageStatus: "abstinent",
    elapsedDays: 120,
  },
];

export const demoAxisLabels = [
  "Inicio",
  "1 mes",
  "3 meses",
  "6 meses",
  "1 año",
] as const;

export interface DemoSeries {
  id: string;
  label: string;
  /** Visual samples along the five axis marks. Not recovery-engine output. */
  samples: readonly number[];
  /**
   * Primary legend value.
   * Live: today’s trajectory advance. Demo chart builder leaves this empty
   * (no shared “today”); compact legend then uses the last sample.
   */
  endLabel: string;
  /**
   * Day-365 checkpoint. Demo chart builder overwrites this from samples.
   */
  referenceAtYearLabel?: string;
  color: string;
}

export const demoSeries: readonly DemoSeries[] = [
  {
    id: "nervous",
    label: "Sistema nervioso",
    samples: [0.08, 0.24, 0.42, 0.56, 0.68],
    endLabel: "",
    color: "rgb(var(--soma-physiology))",
  },
  {
    id: "reward",
    label: "Sistema de recompensa",
    samples: [0.06, 0.16, 0.3, 0.42, 0.54],
    endLabel: "",
    color: "rgb(var(--soma-action))",
  },
  {
    id: "cardiovascular",
    label: "Función cardiovascular",
    samples: [0.1, 0.28, 0.46, 0.6, 0.72],
    endLabel: "",
    color: "rgb(var(--soma-warning))",
  },
  {
    id: "pulmonary",
    label: "Función pulmonar",
    samples: [0.07, 0.2, 0.36, 0.5, 0.61],
    endLabel: "",
    color: "rgb(var(--soma-danger))",
  },
  {
    id: "cognitive",
    label: "Función cognitiva",
    samples: [0.05, 0.14, 0.26, 0.38, 0.49],
    endLabel: "",
    color: "rgb(var(--soma-ink-secondary))",
  },
];

export type DemoOrganIcon =
  | "brain"
  | "lungs"
  | "heart"
  | "digestive"
  | "endocrine"
  | "immune";

export interface DemoChange {
  id: string;
  system: string;
  title: string;
  status: string;
  body: string;
  /** Trajectory percent when a single calculable estimate applies; otherwise empty. */
  endLabel: string;
  /** Visible, accessible note when the estimate excludes other registered substances. */
  note?: string;
  /** System glyph for demo cards. Live organ cards resolve a plate by `id`. */
  icon?: DemoOrganIcon;
}

export const demoChanges: readonly DemoChange[] = [
  {
    id: "dopamine",
    system: "Sistema nervioso",
    title: "Regulación de la dopamina",
    status: "En progreso",
    body: "Los receptores de dopamina comienzan a normalizar su sensibilidad tras la exposición prolongada al cannabis.",
    endLabel: "",
    icon: "brain",
  },
  {
    id: "lungs",
    system: "Sistema respiratorio",
    title: "Función pulmonar",
    status: "En progreso",
    body: "La función pulmonar continúa mejorando, con una reducción de la inflamación y una mayor eficiencia en el intercambio gaseoso.",
    endLabel: "",
    icon: "lungs",
  },
  {
    id: "heart-rate",
    system: "Sistema cardiovascular",
    title: "Frecuencia cardíaca",
    status: "En progreso",
    body: "La frecuencia cardíaca en reposo tiende a estabilizarse tras la reducción de la nicotina, mejorando la variabilidad cardíaca.",
    endLabel: "",
    icon: "heart",
  },
];

export interface DemoSystem {
  id: string;
  name: string;
  /** Combined trajectory percent when honest; otherwise empty. */
  endLabel: string;
  /** Status shown instead of a percent (mixed or active-only). */
  statusLabel?: string;
  /** Clarifies a percent that omits substances without a calculable date. */
  hint?: string;
  icon: DemoOrganIcon;
}

/**
 * Raw demo tiles. Percents for systems that have a chart series are
 * filled from that series’ last sample in `demoDashboardSystems`.
 * Systems without a series stay without a percent.
 */
export const demoSystems: readonly DemoSystem[] = [
  { id: "nervous", name: "Sistema nervioso", endLabel: "", icon: "brain" },
  { id: "cardio", name: "Cardiovascular", endLabel: "", icon: "heart" },
  { id: "respiratory", name: "Respiratorio", endLabel: "", icon: "lungs" },
  { id: "digestive", name: "Digestivo", endLabel: "", icon: "digestive" },
  { id: "endocrine", name: "Endocrino", endLabel: "", icon: "endocrine" },
  { id: "immune", name: "Inmunológico", endLabel: "", icon: "immune" },
];
