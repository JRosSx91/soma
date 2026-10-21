/** Which home milestone belongs to which registered substance. */
export const changeSubstance: Record<string, string> = {
  dopamine: "cannabis",
  lungs: "nicotine",
  "heart-rate": "nicotine",
};

/** Timeline labels for the same three home milestones. */
export const demoMoments: Record<string, string> = {
  dopamine: "Semana 2 del relato",
  lungs: "Semana 3 del relato",
  "heart-rate": "Mes 1 del relato",
};

/** Chart series that already exist on Inicio. Other systems have no curve. */
export const chartSeriesForSystem: Record<string, string | undefined> = {
  nervous: "nervous",
  cardio: "cardiovascular",
  respiratory: "pulmonary",
};

export interface ExploreSubstance {
  id: string;
  name: string;
  blurb: string;
}

/** Catalog for Explorar. The first three match the substances tracked on Inicio. */
export const exploreSubstances: readonly ExploreSubstance[] = [
  {
    id: "cannabis",
    name: "Cannabis",
    blurb: "Ficha de demostración sobre el relato de cannabis que ya aparece en Inicio.",
  },
  {
    id: "nicotine",
    name: "Nicotina",
    blurb: "Ficha de demostración sobre el relato de nicotina que ya aparece en Inicio.",
  },
  {
    id: "cocaine",
    name: "Cocaína",
    blurb: "Ficha de demostración sobre el relato de cocaína que ya aparece en Inicio.",
  },
  {
    id: "caffeine",
    name: "Cafeína",
    blurb: "Ficha de catálogo. Esta demostración no la cuenta como sustancia seguida en Inicio.",
  },
  {
    id: "alcohol",
    name: "Alcohol",
    blurb: "Ficha de catálogo. Esta demostración no la cuenta como sustancia seguida en Inicio.",
  },
];

export interface ExploreCategory {
  id: string;
  name: string;
  summary: string;
  topics: readonly string[];
}

export const exploreCategories: readonly ExploreCategory[] = [
  {
    id: "systems",
    name: "Sistemas del organismo",
    summary: "Agrupa los mismos seis sistemas que muestra Inicio.",
    topics: ["Sistema nervioso", "Respiratorio", "Cardiovascular", "Digestivo", "Endocrino", "Inmunológico"],
  },
  {
    id: "processes",
    name: "Procesos de recuperación",
    summary: "Ordena los tres hitos ficticios del dashboard, sin añadir fases nuevas.",
    topics: ["Regulación de la dopamina", "Función pulmonar", "Frecuencia cardíaca"],
  },
  {
    id: "evidence",
    name: "Evidencia científica",
    summary: "En esta fase no hay estudios enlazados. La sección solo muestra el hueco.",
    topics: ["Sin referencias cargadas"],
  },
  {
    id: "advice",
    name: "Consejos y estrategias",
    summary: "Recordatorios de demostración, no pautas clínicas.",
    topics: ["Anotar el día", "Revisar un sistema", "Volver a Inicio"],
  },
];

export interface AnatomyOrgan {
  id: string;
  name: string;
  src: string;
}

export const anatomyOrgans: Record<string, readonly AnatomyOrgan[]> = {
  nervous: [
    { id: "brain", name: "Cerebro", src: "/images/anatomy/brain.png" },
    { id: "neuron", name: "Neurona", src: "/images/anatomy/neuron.png" },
  ],
  cardio: [{ id: "heart", name: "Corazón", src: "/images/anatomy/heart.png" }],
  respiratory: [{ id: "lungs", name: "Pulmones", src: "/images/anatomy/lungs.png" }],
  digestive: [
    { id: "digestive", name: "Aparato digestivo", src: "/images/anatomy/digestive.png" },
    { id: "liver", name: "Hígado", src: "/images/anatomy/liver.png" },
    { id: "pancreas", name: "Páncreas", src: "/images/anatomy/pancreas.png" },
  ],
  endocrine: [{ id: "thyroid", name: "Tiroides", src: "/images/anatomy/thyroid.png" }],
  immune: [{ id: "immune", name: "Sistema inmunitario", src: "/images/anatomy/immune.png" }],
};

export const anatomyTabs = ["resumen", "efectos", "recuperacion", "consejos"] as const;
export type AnatomyTab = (typeof anatomyTabs)[number];

export const anatomyTabLabel: Record<AnatomyTab, string> = {
  resumen: "Resumen",
  efectos: "Efectos",
  recuperacion: "Recuperación",
  consejos: "Consejos",
};

export function anatomyCopy(systemName: string, tab: AnatomyTab): string {
  if (tab === "resumen") {
    return `${systemName} en esta vista usa la cifra ya mostrada en Inicio. El texto es de demostración y no describe un caso.`;
  }
  if (tab === "efectos") {
    return `La pestaña de efectos de ${systemName} está reservada. No hay un listado clínico en esta fase.`;
  }
  if (tab === "recuperacion") {
    return `La recuperación mostrada para ${systemName} repite la estimación ficticia del dashboard, sin calcular una curva nueva.`;
  }
  return `Consejo de demostración para ${systemName}: abrir la ficha y volver al resumen. No es una recomendación de salud.`;
}

export const recoveryTabs = [
  { id: "general", label: "Vista general" },
  { id: "substance", label: "Por sustancia" },
  { id: "system", label: "Por sistema" },
  { id: "timeline", label: "Cronología" },
] as const;

export type RecoveryTab = (typeof recoveryTabs)[number]["id"];
