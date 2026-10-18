import type { BodySystem } from "@soma/shared-types";
import type { AnatomySource } from "./anatomy-education.ts";

/**
 * Neutral educational notes for atlas systems that have no canonical organs.
 * Independent of substance narratives, recovery curves, and personal data.
 * A missing system returns null. It does not invent OrganId entries.
 */

export interface SystemEducationEntry {
  systemId: BodySystem;
  location: string;
  anatomy: string;
  physiology: string;
  relations: string;
  sources: readonly AnatomySource[];
}

const openStaxEndocrineOverview: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 17.1, An Overview of the Endocrine System.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/17-1-an-overview-of-the-endocrine-system",
  verified: true,
};

const openStaxPns: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 13.4, The Peripheral Nervous System.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/13-4-the-peripheral-nervous-system",
  verified: true,
};

const openStaxAns: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 15.1, Divisions of the Autonomic Nervous System.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/15-1-divisions-of-the-autonomic-nervous-system",
  verified: true,
};

const statPearlsHypothalamus: AnatomySource = {
  citation:
    "Shahid Z, Asuka E, Singh G. Physiology, Hypothalamus. StatPearls, NCBI Bookshelf. Actualización del 1 de mayo de 2023. NBK535380.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK535380/",
  verified: true,
};

const statPearlsPituitary: AnatomySource = {
  citation:
    "Kamel-ElSayed SA, Schwartz J. Physiology, Pituitary Gland. StatPearls, NCBI Bookshelf. Actualización del 1 de mayo de 2023. NBK459247.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK459247/",
  verified: true,
};

const statPearlsAns: AnatomySource = {
  citation:
    "Waxenbaum JA, Reddy V, Das JM. Anatomy, Autonomic Nervous System. StatPearls, NCBI Bookshelf. NBK539845.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK539845/",
  verified: true,
};

const statPearlsSomatic: AnatomySource = {
  citation:
    "Akinrodoye MA, Lui F. Neuroanatomy, Somatic Nervous System. StatPearls, NCBI Bookshelf. Actualización del 7 de noviembre de 2022. NBK556027.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK556027/",
  verified: true,
};

const systemEducationEntries: readonly SystemEducationEntry[] = [
  {
    systemId: "endocrine",
    location:
      "Red de glándulas y tejidos dispersos por el cuerpo —hipófisis, tiroides, paratiroides, adrenales, pineal y otros— coordinados en gran medida desde el hipotálamo en la base del encéfalo.",
    anatomy:
      "El sistema endocrino agrupa glándulas sin conducto que liberan hormonas al líquido extracelular y a la sangre. Las glándulas clásicas incluyen hipófisis (adeno y neurohipófisis), tiroides, paratiroides, adrenales y pineal. Otros órganos —páncreas, gónadas, riñones, tracto digestivo— aportan células endocrinas sin que eso los convierta aquí en órganos canónicos del catálogo Soma. El eje hipotálamo-hipófisis conecta neuronas hipotalámicas con la hipófisis vía portal hipofisario (anterior) o tracto nervioso (posterior).",
    physiology:
      "La señalización hormonal regula metabolismo, crecimiento, equilibrio hídrico, reproducción y respuesta al estrés. El hipotálamo libera factores liberadores o inhibidores que controlan la adenohipófisis; hormonas como ACTH, TSH o gonadotropinas actúan después sobre glándulas periféricas. Bucles de retroalimentación negativa (y a veces positiva) ajustan la secreción. Frente a estrés agudo, la vía simpático-adrenal acelera la liberación de catecolaminas; el eje HPA aporta cortisol de forma más sostenida. La señal endocrina suele ser más lenta y difusa que la sinapsis nerviosa.",
    relations:
      "Se entrelaza con el sistema nervioso: el hipotálamo integra señales neurales y hormonales. Influye en cardiovascular, renal, digestivo y reproductor a través de hormonas. En Soma, páncreas, ovarios y testículos tienen fichas de órgano propias por su anatomía; esta ficha de sistema describe la coordinación endocrina sin añadir nuevos OrganId ni atribuir curvas de órganos inexistentes.",
    sources: [openStaxEndocrineOverview, statPearlsHypothalamus, statPearlsPituitary],
  },
  {
    systemId: "nervous-peripheral",
    location:
      "Fuera del encéfalo y de la médula espinal: nervios craneales y espinales, ganglios y terminaciones en órganos, músculos y piel.",
    anatomy:
      "El sistema nervioso periférico (SNP) comprende 12 pares de nervios craneales y 31 pares de nervios espinales, con ganglios sensitivos (p. ej. ganglios de la raíz dorsal) y, en la vía autónoma, ganglios simpáticos y parasimpáticos. Se distingue un componente somático (aferencias sensitivas y eferencias hacia músculo esquelético) y un componente autónomo (simpático, parasimpático y, en el tubo digestivo, el plexo entérico). No incluye la corteza ni los núcleos del tronco: esos pertenecen al sistema nervioso central.",
    physiology:
      "Las vías aferentes llevan información sensorial al SNC; las eferentes transmiten órdenes motoras. El somático permite movimiento voluntario y reflejos con un solo neurona motora periférica. El autónomo usa en general dos neuronas (pre y posganglionar) para modular vísceras, vasos y glándulas sin control consciente habitual: el simpático favorece respuestas de movilización; el parasimpático, de conservación y digestión. Ambos cooperan con el SNC; no sustituyen la integración central.",
    relations:
      "Converge y diverge respecto al SNC en raíces, nervios craneales y ganglios. Inerva corazón, vías respiratorias, digestivo, piel y gónadas, entre otros. El sistema endocrino y el autónomo se cruzan en la médula adrenal y en el hipotálamo. En el atlas Soma, las estructuras del SNC (corteza prefrontal, hipocampo, etc.) tienen fichas propias; esta ficha cubre el territorio periférico sin inventar órganos canónicos nuevos.",
    sources: [openStaxPns, openStaxAns, statPearlsAns, statPearlsSomatic],
  },
];

const bySystemId = new Map(
  systemEducationEntries.map((entry) => [entry.systemId, entry]),
);

export function educationalSystem(systemId: string): SystemEducationEntry | null {
  return bySystemId.get(systemId as BodySystem) ?? null;
}
