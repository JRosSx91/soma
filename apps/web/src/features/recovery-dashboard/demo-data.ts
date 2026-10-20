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
}

export const demoSubstances: readonly DemoSubstance[] = [
  {
    id: "cannabis",
    name: "Cannabis",
    abstinence: "42 días",
    pillDetail: "42 días sin cannabis",
    phase: "Fase de normalización de neurotransmisores",
    bar: 0.46,
  },
  {
    id: "nicotine",
    name: "Nicotina",
    abstinence: "15 días",
    pillDetail: "15 días sin nicotina",
    phase: "Mejora de la función cardiovascular",
    bar: 0.28,
  },
  {
    id: "cocaine",
    name: "Cocaína",
    abstinence: "4 meses",
    pillDetail: "4 meses sin cocaína",
    phase: "Estabilización de circuitos de recompensa",
    bar: 0.62,
  },
];

export const demoAxisLabels = [
  "Inicio",
  "1 mes",
  "3 meses",
  "6 meses",
  "1 año",
] as const;

/**
 * Horizontal position of the "today" marker on the mockup axis.
 * The axis labels are evenly spaced, as drawn in the reference,
 * so this is a composition value and not a calendar scale.
 */
export const demoTodayPosition = 0.17;
export const demoTodayLabel = "Hoy · 42 días";

export interface DemoSeries {
  id: string;
  label: string;
  /** Visual samples along demoAxisLabels. Not recovery-engine output. */
  samples: readonly number[];
  /**
   * Primary legend value.
   * Live: today’s trajectory advance. Demo: mock “Hoy · …” composition.
   */
  endLabel: string;
  /**
   * Optional day-365 model checkpoint (live). Never replace endLabel.
   * Demo may omit or use a fictional year mark for copy parity.
   */
  referenceAtYearLabel?: string;
  color: string;
}

export const demoSeries: readonly DemoSeries[] = [
  {
    id: "nervous",
    label: "Sistema nervioso",
    samples: [0.08, 0.24, 0.42, 0.56, 0.68],
    endLabel: "Hoy · 46%",
    referenceAtYearLabel: "día 365 · 68%",
    color: "rgb(var(--soma-physiology))",
  },
  {
    id: "reward",
    label: "Sistema de recompensa",
    samples: [0.06, 0.16, 0.3, 0.42, 0.54],
    endLabel: "Hoy · 28%",
    referenceAtYearLabel: "día 365 · 54%",
    color: "rgb(var(--soma-action))",
  },
  {
    id: "cardiovascular",
    label: "Función cardiovascular",
    samples: [0.1, 0.28, 0.46, 0.6, 0.72],
    endLabel: "Hoy · 72%",
    referenceAtYearLabel: "día 365 · 72%",
    color: "rgb(var(--soma-warning))",
  },
  {
    id: "pulmonary",
    label: "Función pulmonar",
    samples: [0.07, 0.2, 0.36, 0.5, 0.61],
    endLabel: "Hoy · 61%",
    referenceAtYearLabel: "día 365 · 61%",
    color: "rgb(var(--soma-danger))",
  },
  {
    id: "cognitive",
    label: "Función cognitiva",
    samples: [0.05, 0.14, 0.26, 0.38, 0.49],
    endLabel: "Hoy · 26%",
    referenceAtYearLabel: "día 365 · 49%",
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
  endLabel: string;
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
    endLabel: "54%",
    icon: "brain",
  },
  {
    id: "lungs",
    system: "Sistema respiratorio",
    title: "Función pulmonar",
    status: "En progreso",
    body: "La función pulmonar continúa mejorando, con una reducción de la inflamación y una mayor eficiencia en el intercambio gaseoso.",
    endLabel: "61%",
    icon: "lungs",
  },
  {
    id: "heart-rate",
    system: "Sistema cardiovascular",
    title: "Frecuencia cardíaca",
    status: "En progreso",
    body: "La frecuencia cardíaca en reposo tiende a estabilizarse tras la reducción de la nicotina, mejorando la variabilidad cardíaca.",
    endLabel: "72%",
    icon: "heart",
  },
];

export interface DemoSystem {
  id: string;
  name: string;
  endLabel: string;
  icon: DemoOrganIcon;
}

/**
 * Tile figures follow the mockup. They do not match the chart legend
 * one to one: the reference itself shows 68% for the nervous system
 * on the chart and 54% on the tile.
 */
export const demoSystems: readonly DemoSystem[] = [
  { id: "nervous", name: "Sistema nervioso", endLabel: "54%", icon: "brain" },
  { id: "cardio", name: "Cardiovascular", endLabel: "72%", icon: "heart" },
  { id: "respiratory", name: "Respiratorio", endLabel: "61%", icon: "lungs" },
  { id: "digestive", name: "Digestivo", endLabel: "48%", icon: "digestive" },
  { id: "endocrine", name: "Endocrino", endLabel: "52%", icon: "endocrine" },
  { id: "immune", name: "Inmunológico", endLabel: "66%", icon: "immune" },
];
