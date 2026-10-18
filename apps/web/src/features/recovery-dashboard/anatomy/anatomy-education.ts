import type { OrganId } from "@soma/shared-types";

/**
 * Neutral anatomical notes for the explorer summary.
 * Independent of substance narratives, recovery curves, and personal data.
 * A missing organ returns null. It does not borrow another organ's text.
 */

export interface AnatomySource {
  citation: string;
  href: string;
  /** True only when this session checked the cited page against the wording. */
  verified: boolean;
}

export interface AnatomyEducationEntry {
  organId: OrganId;
  /**
   * Optional anatomical site (e.g. cavity, region). Absent until authored.
   * Not inferred from system membership or another organ's ficha.
   */
  location?: string;
  anatomy: string;
  physiology: string;
  relations: string;
  sources: readonly AnatomySource[];
}

const openStaxRespiratory: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 22.1, Organs and Structures of the Respiratory System.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system",
  verified: true,
};

const statPearlsNasalCavity: AnatomySource = {
  citation:
    "Sobiesk JL, Munakomi S. Anatomy, Head and Neck, Nasal Cavity. StatPearls, NCBI Bookshelf. Actualización del 24 de julio de 2023.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK544232/",
  verified: true,
};

const kenhubLowerAirway: AnatomySource = {
  citation:
    "Crumbie L, Mytilinaios D. Histology of the lower respiratory tract. Kenhub. Revisión del 12 de octubre de 2026.",
  href: "https://www.kenhub.com/en/library/anatomy/histology-of-the-lower-respiratory-tract",
  verified: true,
};

const ntuAirBloodBarrier: AnatomySource = {
  citation:
    "National Taiwan University. Web-based Electron Microscopic Atlas of Histology. Respiratory system, air–blood barrier.",
  href: "https://homepage.ntu.edu.tw/~mingfongchang/EM/respiratory.html",
  verified: true,
};

const respiratoryEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "lungs",
    anatomy:
      "Los pulmones alojan el territorio en el que el aire queda junto a la sangre. Dentro de cada pulmón, la vía aérea continúa más allá de los bronquios: se divide en bronquiolos y desemboca en alvéolos, pequeños sacos rodeados de capilares. Los bronquiolos no son bronquios. Son conductos más finos y carecen de cartílago.",
    physiology:
      "En los alvéolos se intercambian gases. El oxígeno pasa a la sangre y el dióxido de carbono sale hacia el aire alveolar a través de la barrera alveolocapilar: el epitelio alveolar, las membranas basales y el endotelio del capilar. Ese intercambio no ocurre en los bronquios ni en la mucosa nasal.",
    relations:
      "El aire llega desde la tráquea por los bronquios principales, que entran en el pulmón por el hilio, junto con vasos sanguíneos y nervios. Esos bronquios tienen su propia ficha. La mucosa nasal queda antes, en la cavidad nasal: acondiciona el aire y no forma parte del pulmón.",
    sources: [openStaxRespiratory, ntuAirBloodBarrier],
  },
  {
    organId: "bronchi",
    anatomy:
      "Los bronquios son las vías aéreas en que se divide la tráquea, una hacia cada pulmón. Los bronquios principales, antes de entrar en el pulmón, conservan anillos de cartílago parecidos a los de la tráquea. Ya dentro del pulmón, el cartílago forma placas discontinuas, no anillos. Los bronquiolos, más adelante, carecen de cartílago. El revestimiento bronquial es un epitelio con cilios y células caliciformes, que producen moco.",
    physiology:
      "Sirven de paso para el aire que entra y sale de cada pulmón. El moco retiene partículas y microorganismos arrastrados por ese aire, y los cilios lo desplazan. El intercambio de gases no ocurre aquí: corresponde a los alvéolos, dentro del pulmón.",
    relations:
      "Nacen de la tráquea en la carina y entran en los pulmones por el hilio. Dentro del pulmón se ramifican en un árbol bronquial. De las ramas más distales salen los bronquiolos, conductos sin cartílago que conducen hacia los alvéolos. La mucosa nasal está en la nariz, antes de esta vía.",
    sources: [openStaxRespiratory, kenhubLowerAirway],
  },
  {
    organId: "nasal-mucosa",
    anatomy:
      "La mucosa nasal reviste la cavidad nasal. En la región respiratoria, la más extensa, el epitelio tiene cilios y células que secretan moco, sobre un tejido bien vascularizado. En la parte superior hay otra región, la olfatoria, con un epitelio distinto.",
    physiology:
      "Al entrar el aire, esta mucosa lo calienta, lo humedece y retiene partículas. Los cilios empujan el moco hacia la faringe. La región olfatoria interviene en la detección de olores. No intercambia oxígeno ni dióxido de carbono: esa función corresponde a los alvéolos del pulmón.",
    relations:
      "Cubre las paredes de la cavidad nasal, incluidos los cornetes, que amplían la superficie en contacto con el aire. Hacia atrás se continúa con la nasofaringe. El aire sigue después por la laringe y la tráquea hasta los bronquios. Las secreciones de los senos paranasales drenan hacia esta cavidad.",
    sources: [openStaxRespiratory, statPearlsNasalCavity],
  },
];

const byOrganId = new Map(respiratoryEducation.map((entry) => [entry.organId, entry]));

export function educationalAnatomy(organId: string): AnatomyEducationEntry | null {
  return byOrganId.get(organId as OrganId) ?? null;
}
