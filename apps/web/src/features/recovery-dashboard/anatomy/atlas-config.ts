import type { AtlasOrgan, AtlasPlate, AtlasSystem, AtlasViewId, UnboundAnatomyFile } from "./atlas-types.js";

const noRegions = { anterior: null, posterior: null } as const;

function organ(id: AtlasOrgan["id"], name: string, plate: AtlasPlate | null = null): AtlasOrgan {
  return { id, name, plate, regions: { ...noRegions } };
}

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

const heartPlate: AtlasPlate = {
  src: "/images/anatomy/heart.png",
  depicts: "Corazón.",
};

const liverPlate: AtlasPlate = {
  src: "/images/anatomy/liver.png",
  depicts: "Hígado.",
};

const stomachPlate: AtlasPlate = {
  src: "/images/anatomy/stomach.png",
  depicts:
    "Estómago con porción distal del esófago y duodeno proximal. Ilustración educativa; no es un mapa histológico.",
};

const pancreasPlate: AtlasPlate = {
  src: "/images/anatomy/pancreas.png",
  depicts:
    "Páncreas con asa duodenal y conducto pancreático resaltado. Ilustración educativa; no es un mapa histológico.",
};

const intestinesPlate: AtlasPlate = {
  src: "/images/anatomy/intestines.png",
  depicts:
    "Intestino delgado e intestino grueso en conjunto. Ilustración educativa; no es un mapa histológico.",
};

const oralMucosaPlate: AtlasPlate = {
  src: "/images/anatomy/oral-mucosa.png",
  depicts:
    "Cavidad oral con la mucosa resaltada. Ilustración educativa; no sustituye un corte histológico ni representa dientes o glándulas salivales como órgano.",
};

const kidneysPlate: AtlasPlate = {
  src: "/images/anatomy/kidneys.png",
  depicts: "Riñones.",
};

const spleenPlate: AtlasPlate = {
  src: "/images/anatomy/spleen.png",
  depicts:
    "Bazo con hilio vascular. Ilustración educativa; no es un mapa histológico.",
};

const testesPlate: AtlasPlate = {
  src: "/images/anatomy/testes.png",
  depicts:
    "Testículo con epidídimo y vasos. Ilustración educativa; no es un mapa histológico.",
};

const ovariesPlate: AtlasPlate = {
  src: "/images/anatomy/ovaries.png",
  depicts:
    "Ovarios en contexto de útero y trompas. Ilustración educativa; el órgano canónico sigue siendo ovarios.",
};

const skinPlate: AtlasPlate = {
  src: "/images/anatomy/skin.png",
  depicts:
    "Corte de piel con epidermis, dermis e hipodermis. Ilustración educativa; no es un mapa histológico.",
};

const teethPlate: AtlasPlate = {
  src: "/images/anatomy/teeth.png",
  depicts:
    "Corte de diente molar con pulpa, encía y hueso alveolar. Ilustración educativa; no es un mapa histológico.",
};

const eyesPlate: AtlasPlate = {
  src: "/images/anatomy/eyes.png",
  depicts:
    "Corte del globo ocular con retina, cristalino y nervio óptico. Ilustración educativa; no es un mapa histológico.",
};

const prefrontalCortexPlate: AtlasPlate = {
  src: "/images/anatomy/prefrontal-cortex.png",
  depicts:
    "Encéfalo en vista lateral con la corteza prefrontal resaltada. Ilustración educativa; no es un mapa histológico.",
};

const hippocampusPlate: AtlasPlate = {
  src: "/images/anatomy/hippocampus.png",
  depicts:
    "Corte sagital del encéfalo con el hipocampo resaltado. Ilustración educativa; no es un mapa histológico.",
};

const vtaPlate: AtlasPlate = {
  src: "/images/anatomy/ventral-tegmental-area.png",
  depicts:
    "Corte sagital del encéfalo con el área tegmental ventral resaltada. Ilustración educativa; no es un mapa histológico.",
};

const nucleusAccumbensPlate: AtlasPlate = {
  src: "/images/anatomy/nucleus-accumbens.png",
  depicts:
    "Corte coronal del encéfalo con el núcleo accumbens resaltado. Ilustración educativa; no es un mapa histológico.",
};

const amygdalaPlate: AtlasPlate = {
  src: "/images/anatomy/amygdala.png",
  depicts:
    "Corte sagital del encéfalo con la amígdala resaltada. Ilustración educativa; no es un mapa histológico.",
};

/** Full-body anterior system plate aligned with the body master (1024×1536). */
function systemPlate(src: string, depicts: string): AtlasPlate {
  return { src, depicts, aspectRatio: "1024 / 1536" };
}

const centralNervousSystemPlate = systemPlate(
  "/images/anatomy/system-central-nervous.png",
  "Cuerpo en vista anterior con encéfalo y médula espinal resaltados. Sin regiones de órganos.",
);

const cardiovascularSystemPlate = systemPlate(
  "/images/anatomy/system-cardiovascular.png",
  "Cuerpo en vista anterior con el sistema cardiovascular resaltado. Sin regiones de órganos.",
);

const respiratorySystemPlate = systemPlate(
  "/images/anatomy/respiratory-highlight-anterior.png",
  "Cuerpo en vista anterior con el sistema respiratorio resaltado. Sin regiones de órganos.",
);

const digestiveSystemPlate = systemPlate(
  "/images/anatomy/system-digestive.png",
  "Cuerpo en vista anterior con el tracto digestivo resaltado. El hígado también aparece; el sistema hepático del catálogo tiene su propia lámina.",
);

const hepaticSystemPlate = systemPlate(
  "/images/anatomy/system-hepatic.png",
  "Cuerpo en vista anterior con el hígado y la vía biliar resaltados. Sin regiones de órganos.",
);

const renalSystemPlate = systemPlate(
  "/images/anatomy/system-renal.png",
  "Cuerpo en vista anterior con riñones, uréteres y vejiga resaltados. Sin regiones de órganos.",
);

const immuneSystemPlate = systemPlate(
  "/images/anatomy/system-immune.png",
  "Cuerpo en vista anterior con órganos y estructuras linfáticas resaltados. Sin regiones de órganos.",
);

const reproductiveSystemPlate = systemPlate(
  "/images/anatomy/system-reproductive.png",
  "Cuerpo en vista anterior con el aparato reproductor masculino resaltado. Sin regiones de órganos.",
);

const integumentarySystemPlate = systemPlate(
  "/images/anatomy/system-integumentary.png",
  "Cuerpo en vista anterior con piel y anexos cutáneos resaltados. Sin regiones de órganos.",
);

const sensorySystemPlate = systemPlate(
  "/images/anatomy/system-sensory.png",
  "Cuerpo en vista anterior con órganos de los sentidos resaltados. Sin regiones de órganos.",
);

const endocrineSystemPlate = systemPlate(
  "/images/anatomy/system-endocrine.png",
  "Cuerpo en vista anterior con glándulas endocrinas resaltadas. Sin regiones de órganos.",
);

const peripheralNervousSystemPlate = systemPlate(
  "/images/anatomy/system-peripheral-nervous.png",
  "Cuerpo en vista anterior con nervios periféricos resaltados; encéfalo y médula atenuados. Sin regiones de órganos.",
);

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
    plates: { anterior: centralNervousSystemPlate, posterior: null },
    organs: [
      organ("brain-prefrontal-cortex", "Corteza prefrontal", prefrontalCortexPlate),
      organ("brain-hippocampus", "Hipocampo", hippocampusPlate),
      organ("brain-vta", "Área tegmental ventral", vtaPlate),
      organ("brain-nucleus-accumbens", "Núcleo accumbens", nucleusAccumbensPlate),
      organ("brain-amygdala", "Amígdala", amygdalaPlate),
    ],
  },
  {
    id: "cardiovascular",
    catalogSystem: "cardiovascular",
    name: "Sistema cardiovascular",
    plates: { anterior: cardiovascularSystemPlate, posterior: null },
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
    plates: { anterior: digestiveSystemPlate, posterior: null },
    organs: [
      organ("stomach", "Estómago", stomachPlate),
      organ("pancreas", "Páncreas", pancreasPlate),
      organ("intestines", "Intestinos", intestinesPlate),
      organ("oral-mucosa", "Mucosa oral", oralMucosaPlate),
    ],
  },
  {
    id: "hepatic",
    catalogSystem: "hepatic",
    name: "Sistema hepático",
    plates: { anterior: hepaticSystemPlate, posterior: null },
    organs: [organ("liver", "Hígado", liverPlate)],
  },
  {
    id: "renal",
    catalogSystem: "renal",
    name: "Sistema renal",
    plates: { anterior: renalSystemPlate, posterior: null },
    organs: [organ("kidneys", "Riñones", kidneysPlate)],
  },
  {
    id: "immune",
    catalogSystem: "immune",
    name: "Sistema linfático",
    plates: { anterior: immuneSystemPlate, posterior: null },
    organs: [organ("spleen", "Bazo", spleenPlate)],
  },
  {
    id: "reproductive",
    catalogSystem: "reproductive",
    name: "Sistema reproductor",
    plates: { anterior: reproductiveSystemPlate, posterior: null },
    organs: [
      organ("testes", "Testículos", testesPlate),
      organ("ovaries", "Ovarios", ovariesPlate),
    ],
  },
  {
    id: "integumentary",
    catalogSystem: "integumentary",
    name: "Sistema tegumentario",
    plates: { anterior: integumentarySystemPlate, posterior: null },
    organs: [organ("skin", "Piel", skinPlate), organ("teeth", "Dientes", teethPlate)],
  },
  {
    id: "sensory",
    catalogSystem: "sensory",
    name: "Sistema sensorial",
    plates: { anterior: sensorySystemPlate, posterior: null },
    organs: [organ("eyes", "Ojos", eyesPlate)],
  },
  {
    id: "endocrine",
    catalogSystem: "endocrine",
    name: "Sistema endocrino",
    plates: { anterior: endocrineSystemPlate, posterior: null },
    organs: [],
  },
  {
    id: "nervous-peripheral",
    catalogSystem: "nervous-peripheral",
    name: "Sistema nervioso periférico",
    plates: { anterior: peripheralNervousSystemPlate, posterior: null },
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
    src: "/images/anatomy/brain.png",
    reason:
      "Lámina de órgano aislado. El sistema nervioso central usa la lámina de cuerpo completo system-central-nervous.png.",
  },
  {
    src: "/images/anatomy/digestive.png",
    reason:
      "Mezcla hígado, estómago, páncreas e intestinos. El sistema digestivo usa system-digestive.png; esta lámina no se usa como mapa.",
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
    src: "/images/anatomy/reproductive.png",
    reason:
      "Lámina conjunta antigua. El sistema reproductor usa system-reproductive.png; esta copia no se enlaza.",
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
