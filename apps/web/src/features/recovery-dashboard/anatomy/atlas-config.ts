import type { AtlasOrgan, AtlasPlate, AtlasSystem, AtlasViewId, UnboundAnatomyFile } from "./atlas-types.js";

const noRegions = { anterior: null, posterior: null } as const;

function organ(id: AtlasOrgan["id"], name: string, plate: AtlasPlate | null = null): AtlasOrgan {
  return { id, name, plate, regions: { ...noRegions } };
}

const brainPlate: AtlasPlate = {
  src: "/images/anatomy/brain.png",
  depicts: "Cerebro en vista lateral. No separa las estructuras del catálogo.",
};

const lungsPlate: AtlasPlate = {
  src: "/images/anatomy/lungs.png",
  depicts: "Pulmones y vía aérea central. No separa bronquios ni mucosa nasal.",
};

const bronchiPlate: AtlasPlate = {
  src: "/images/anatomy/bronchi.png",
  depicts: "Árbol bronquial. No incluye los alvéolos ni la mucosa nasal.",
};

const nasalMucosaPlate: AtlasPlate = {
  src: "/images/anatomy/nasal-mucosa.png",
  depicts: "Corte de la cavidad nasal. No incluye bronquios ni pulmones.",
};

const respiratorySystemPlate: AtlasPlate = {
  src: "/images/anatomy/respiratory-highlight-anterior.png",
  depicts: "Cuerpo en vista anterior con el sistema respiratorio resaltado. Sin regiones de órganos.",
  aspectRatio: "1024 / 1536",
};

const heartPlate: AtlasPlate = {
  src: "/images/anatomy/heart.png",
  depicts: "Corazón.",
};

const liverPlate: AtlasPlate = {
  src: "/images/anatomy/liver.png",
  depicts: "Hígado.",
};

const pancreasPlate: AtlasPlate = {
  src: "/images/anatomy/pancreas.png",
  depicts: "Páncreas.",
};

const kidneysPlate: AtlasPlate = {
  src: "/images/anatomy/kidneys.png",
  depicts: "Riñones.",
};

const reproductivePlate: AtlasPlate = {
  src: "/images/anatomy/reproductive.png",
  depicts:
    "Lámina conjunta de los aparatos reproductores. Incluye estructuras que no son órganos del catálogo.",
};

/**
 * Systems and organs follow the Soma catalog. Plates are bound only when
 * a file depicts that organ or system without being used as a hit map.
 * Posterior views and region paths stay empty until a registered layer exists.
 */
export const atlasSystems: readonly AtlasSystem[] = [
  {
    id: "nervous-central",
    catalogSystem: "nervous-central",
    name: "Sistema nervioso central",
    plates: { anterior: brainPlate, posterior: null },
    organs: [
      organ("brain-prefrontal-cortex", "Corteza prefrontal"),
      organ("brain-hippocampus", "Hipocampo"),
      organ("brain-vta", "Área tegmental ventral"),
      organ("brain-nucleus-accumbens", "Núcleo accumbens"),
      organ("brain-amygdala", "Amígdala"),
    ],
  },
  {
    id: "cardiovascular",
    catalogSystem: "cardiovascular",
    name: "Sistema cardiovascular",
    plates: { anterior: heartPlate, posterior: null },
    organs: [organ("heart", "Corazón", heartPlate)],
  },
  {
    id: "respiratory",
    catalogSystem: "respiratory",
    name: "Sistema respiratorio",
    plates: { anterior: respiratorySystemPlate, posterior: null },
    organs: [
      organ("lungs", "Pulmones", lungsPlate),
      organ("bronchi", "Bronquios", bronchiPlate),
      organ("nasal-mucosa", "Mucosa nasal", nasalMucosaPlate),
    ],
  },
  {
    id: "digestive",
    catalogSystem: "digestive",
    name: "Sistema digestivo",
    plates: { anterior: null, posterior: null },
    organs: [
      organ("stomach", "Estómago"),
      organ("pancreas", "Páncreas", pancreasPlate),
      organ("intestines", "Intestinos"),
      organ("oral-mucosa", "Mucosa oral"),
    ],
  },
  {
    id: "hepatic",
    catalogSystem: "hepatic",
    name: "Sistema hepático",
    plates: { anterior: liverPlate, posterior: null },
    organs: [organ("liver", "Hígado", liverPlate)],
  },
  {
    id: "renal",
    catalogSystem: "renal",
    name: "Sistema renal",
    plates: { anterior: kidneysPlate, posterior: null },
    organs: [organ("kidneys", "Riñones", kidneysPlate)],
  },
  {
    id: "immune",
    catalogSystem: "immune",
    name: "Sistema inmunitario",
    plates: { anterior: null, posterior: null },
    organs: [organ("spleen", "Bazo")],
  },
  {
    id: "reproductive",
    catalogSystem: "reproductive",
    name: "Sistema reproductor",
    plates: { anterior: reproductivePlate, posterior: null },
    organs: [organ("testes", "Testículos"), organ("ovaries", "Ovarios")],
  },
  {
    id: "integumentary",
    catalogSystem: "integumentary",
    name: "Sistema tegumentario",
    plates: { anterior: null, posterior: null },
    organs: [organ("skin", "Piel"), organ("teeth", "Dientes")],
  },
  {
    id: "sensory",
    catalogSystem: "sensory",
    name: "Sistema sensorial",
    plates: { anterior: null, posterior: null },
    organs: [organ("eyes", "Ojos")],
  },
  {
    id: "endocrine",
    catalogSystem: "endocrine",
    name: "Sistema endocrino",
    plates: { anterior: null, posterior: null },
    organs: [],
  },
  {
    id: "nervous-peripheral",
    catalogSystem: "nervous-peripheral",
    name: "Sistema nervioso periférico",
    plates: { anterior: null, posterior: null },
    organs: [],
  },
];

/**
 * Full-body plate for the atlas root. It is a visual reference, not a hit map:
 * no organ regions are registered on it.
 */
export const bodyAtlasView: {
  name: string;
  plates: Record<AtlasViewId, AtlasPlate | null>;
} = {
  name: "Cuerpo humano",
  plates: {
    anterior: {
      src: "/images/anatomy/body-master-anterior.png",
      depicts: "Cuerpo humano en vista anterior. Referencia visual, sin regiones de órganos.",
      aspectRatio: "1024 / 1536",
    },
    posterior: null,
  },
};

export const unboundAnatomyFiles: readonly UnboundAnatomyFile[] = [
  {
    src: "/images/anatomy/digestive.png",
    reason:
      "Mezcla hígado, estómago, páncreas e intestinos. El hígado pertenece a otro sistema del catálogo, así que la lámina no se usa como mapa.",
  },
  {
    src: "/images/anatomy/immune.png",
    reason: "Es una ilustración celular. El órgano inmunitario del catálogo es el bazo, y esta lámina no lo muestra.",
  },
  {
    src: "/images/anatomy/neuron.png",
    reason: "No corresponde a un órgano del catálogo.",
  },
  {
    src: "/images/anatomy/thyroid.png",
    reason: "No hay un órgano tiroides en el catálogo.",
  },
  {
    src: "/images/anatomy/muscular.png",
    reason: "No hay un sistema musculoesquelético ni órganos musculares en el catálogo.",
  },
  {
    src: "/images/anatomy/respiratory-highlight-anterior-global-fit.png",
    reason: "Copia de una prueba de alineación. No se usa como lámina del atlas.",
  },
];

export const defaultAtlasSystemId = "respiratory";
