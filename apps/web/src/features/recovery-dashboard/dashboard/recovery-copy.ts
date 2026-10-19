/**
 * Localized strings for Recovery live/demo chrome.
 *
 * The adapter never imports i18next. Callers pass this contract.
 * Templates use {{token}} interpolation via `fillRecoveryTemplate`.
 */
export interface RecoveryDashboardCopy {
  unavailable: string;
  today: string;
  day365: string;
  axisLabels: readonly [string, string, string, string, string];
  liveFootnote: string;
  demoFootnote: string;
  dayOne: string;
  daysMany: string;
  activeShort: string;
  pillActive: string;
  pillMissingDate: string;
  pillAbstinent: string;
  todayWithDays: string;
  todayWithDaysAndName: string;
  phaseActive: string;
  phaseMissingDate: string;
  phaseNoCurves: string;
  substancePhaseDefault: string;
  substancePhaseCeiling: string;
  substancePhaseConfidence: string;
  substancePhaseCeilingConfidence: string;
  confidenceHigh: string;
  confidenceMedium: string;
  confidenceLow: string;
  statusRecovering: string;
  statusActive: string;
  organBodyAbstinent: string;
  organBodyActive: string;
  organFallback: string;
  loadErrorLive: string;
}

export type RecoveryCopySource = (key: string) => string;

export function fillRecoveryTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, token: string) => {
    const value = vars[token];
    return value == null ? "" : String(value);
  });
}

export function recoveryCopyFromSource(
  t: RecoveryCopySource,
): RecoveryDashboardCopy {
  return {
    unavailable: t("unavailable"),
    today: t("today"),
    day365: t("day365"),
    axisLabels: [
      t("axisStart"),
      t("axis1Month"),
      t("axis3Months"),
      t("axis6Months"),
      t("axis1Year"),
    ],
    liveFootnote: t("liveFootnote"),
    demoFootnote: t("demoFootnote"),
    dayOne: t("dayOne"),
    daysMany: t("daysMany"),
    activeShort: t("activeShort"),
    pillActive: t("pillActive"),
    pillMissingDate: t("pillMissingDate"),
    pillAbstinent: t("pillAbstinent"),
    todayWithDays: t("todayWithDays"),
    todayWithDaysAndName: t("todayWithDaysAndName"),
    phaseActive: t("phaseActive"),
    phaseMissingDate: t("phaseMissingDate"),
    phaseNoCurves: t("phaseNoCurves"),
    substancePhaseDefault: t("substancePhaseDefault"),
    substancePhaseCeiling: t("substancePhaseCeiling"),
    substancePhaseConfidence: t("substancePhaseConfidence"),
    substancePhaseCeilingConfidence: t("substancePhaseCeilingConfidence"),
    confidenceHigh: t("confidenceHigh"),
    confidenceMedium: t("confidenceMedium"),
    confidenceLow: t("confidenceLow"),
    statusRecovering: t("statusRecovering"),
    statusActive: t("statusActive"),
    organBodyAbstinent: t("organBodyAbstinent"),
    organBodyActive: t("organBodyActive"),
    organFallback: t("organFallback"),
    loadErrorLive: t("loadErrorLive"),
  };
}

const SPANISH_RECOVERY_BUNDLE: Record<string, string> = {
  unavailable: "—",
  today: "Hoy",
  day365: "día 365",
  axisStart: "Inicio",
  axis1Month: "1 mes",
  axis3Months: "3 meses",
  axis6Months: "6 meses",
  axis1Year: "1 año",
  liveFootnote:
    "Trayectoria estimada del catálogo Soma. «Hoy» usa los días reales desde la última fecha registrada; las marcas del eje (1 mes a 1 año) son puntos de referencia del modelo, no una predicción clínica ni el final de la recuperación.",
  demoFootnote:
    "Valores de demostración. «Hoy» es una posición ficticia del mockup; no usa datos de cuenta. No es una medición clínica.",
  dayOne: "1 día",
  daysMany: "{{count}} días",
  activeShort: "Activo",
  pillActive: "Consumo activo de {{name}}",
  pillMissingDate: "{{name}}: fecha de último consumo ausente",
  pillAbstinent: "{{days}} sin {{name}}",
  todayWithDays: "{{today}} · {{days}}",
  todayWithDaysAndName: "{{today}} · {{days}} · {{name}}",
  phaseActive:
    "Consumo activo. El avance de la trayectoria estimada no progresa mientras el consumo continúa.",
  phaseMissingDate:
    "Falta la fecha de la última vez, así que no se puede calcular el avance de la trayectoria estimada.",
  phaseNoCurves:
    "Esta sustancia no tiene curvas de trayectoria en el catálogo, así que no se muestra un porcentaje.",
  substancePhaseDefault: "Avance de la trayectoria estimada del catálogo Soma",
  substancePhaseCeiling:
    "Avance de la trayectoria estimada · Techo del modelo: {{percent}}%",
  substancePhaseConfidence:
    "Avance de la trayectoria estimada · confianza {{confidence}}",
  substancePhaseCeilingConfidence:
    "Avance de la trayectoria estimada · Techo del modelo: {{percent}}% · confianza {{confidence}}",
  confidenceHigh: "alta",
  confidenceMedium: "media",
  confidenceLow: "baja",
  statusRecovering: "En trayectoria estimada",
  statusActive: "Consumo activo",
  organBodyAbstinent:
    "{{organ}}: avance de la trayectoria estimada {{percent}} tras {{days}} sin {{substance}}. No equivale a una medición clínica.",
  organBodyActive:
    "{{organ}}: el consumo activo mantiene el avance de la trayectoria estimada en 0 % para esta estimación.",
  organFallback: "Órgano",
  loadErrorLive: "No se han podido cargar tus datos de recuperación.",
};

/** Spanish fixture for adapter tests (same strings as locales/es/recovery.json). */
export const SPANISH_RECOVERY_COPY: RecoveryDashboardCopy = recoveryCopyFromSource(
  (key) => SPANISH_RECOVERY_BUNDLE[key] ?? key,
);
