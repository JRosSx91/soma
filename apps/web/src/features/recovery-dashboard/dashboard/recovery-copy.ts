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
  liveFootnoteOverlay: string;
  demoFootnote: string;
  dayOne: string;
  daysMany: string;
  activeShort: string;
  pillActive: string;
  pillMissingDate: string;
  pillAbstinent: string;
  todayWithDays: string;
  todayWithDaysAndName: string;
  todayCurveLegend: string;
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
  statusMixed: string;
  organBodyAbstinent: string;
  organBodyActive: string;
  organBodyMixed: string;
  organEstimatePartial: string;
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
    liveFootnoteOverlay: t("liveFootnoteOverlay"),
    demoFootnote: t("demoFootnote"),
    dayOne: t("dayOne"),
    daysMany: t("daysMany"),
    activeShort: t("activeShort"),
    pillActive: t("pillActive"),
    pillMissingDate: t("pillMissingDate"),
    pillAbstinent: t("pillAbstinent"),
    todayWithDays: t("todayWithDays"),
    todayWithDaysAndName: t("todayWithDaysAndName"),
    todayCurveLegend: t("todayCurveLegend"),
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
    statusMixed: t("statusMixed"),
    organBodyAbstinent: t("organBodyAbstinent"),
    organBodyActive: t("organBodyActive"),
    organBodyMixed: t("organBodyMixed"),
    organEstimatePartial: t("organEstimatePartial"),
    organFallback: t("organFallback"),
    loadErrorLive: t("loadErrorLive"),
  };
}

const SPANISH_RECOVERY_BUNDLE: Record<string, string> = {
  unavailable: "Fecha pendiente",
  today: "Hoy",
  day365: "día 365",
  axisStart: "Inicio",
  axis1Month: "1 mes",
  axis3Months: "3 meses",
  axis6Months: "6 meses",
  axis1Year: "365 días",
  liveFootnote:
    "Trayectoria estimada del catálogo Soma. «Hoy» usa los días reales desde la última fecha registrada; las marcas del eje (1 mes a 365 días) son puntos de referencia del modelo, no una predicción clínica ni el final de la recuperación.",
  liveFootnoteOverlay:
    "Como las sustancias tienen distintos días de abstinencia, no podemos señalar un único «hoy» en el gráfico.",
  demoFootnote:
    "Valores de demostración. «Hoy» es una posición ficticia del mockup; no usa datos de cuenta.",
  dayOne: "1 día",
  daysMany: "{{count}} días",
  activeShort: "Consumo activo",
  pillActive: "Consumo activo de {{name}}",
  pillMissingDate: "{{name}}: fecha de último consumo ausente",
  pillAbstinent: "{{days}} sin {{name}}",
  todayWithDays: "{{today}} · {{days}}",
  todayWithDaysAndName: "{{today}} · {{days}} · {{name}}",
  todayCurveLegend: "{{today}} · {{percent}} % de la curva",
  phaseActive:
    "No mostramos un recuento de abstinencia mientras el consumo siga registrado como activo.",
  phaseMissingDate:
    "Añade la fecha del último consumo para ver el tiempo transcurrido.",
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
  statusMixed: "Situación mixta",
  organBodyAbstinent:
    "{{organ}}: avance de la trayectoria estimada {{percent}} tras {{days}} sin {{substance}}. No equivale a una medición clínica.",
  organBodyActive:
    "{{organ}}: el consumo sigue registrado como activo, así que no mostramos un avance de curva para esta estimación.",
  organBodyMixed:
    "Hay sustancias con consumo activo y otras con abstinencia registrada. No mostramos un avance conjunto.",
  organEstimatePartial:
    "Esta estimación solo incluye las sustancias con una fecha de último consumo registrada y una trayectoria calculable.",
  organFallback: "Órgano",
  loadErrorLive: "No se han podido cargar tus datos de recuperación.",
};

/** Spanish fixture for adapter tests (same strings as locales/es/recovery.json). */
export const SPANISH_RECOVERY_COPY: RecoveryDashboardCopy = recoveryCopyFromSource(
  (key) => SPANISH_RECOVERY_BUNDLE[key] ?? key,
);
