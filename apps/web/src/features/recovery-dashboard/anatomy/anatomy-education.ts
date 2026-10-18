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

const openStaxCns: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 13.2, The Central Nervous System.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/13-2-the-central-nervous-system",
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

const statPearlsPrefrontal: AnatomySource = {
  citation:
    "Neuroanatomy, Prefrontal Cortex. StatPearls, NCBI Bookshelf. NBK499919.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK499919/",
  verified: true,
};

const statPearlsHippocampus: AnatomySource = {
  citation:
    "Fogwe DT, Reddy V, Mesfin FB. Neuroanatomy, Hippocampus. StatPearls, NCBI Bookshelf. NBK482171.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK482171/",
  verified: true,
};

const statPearlsAmygdala: AnatomySource = {
  citation:
    "AbuHasan Q, Reddy V, Siddiqui W. Neuroanatomy, Amygdala. StatPearls, NCBI Bookshelf. Actualización del 17 de julio de 2023. NBK537102.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK537102/",
  verified: true,
};

const statPearlsLimbic: AnatomySource = {
  citation:
    "Neuroanatomy, Limbic System. StatPearls, NCBI Bookshelf. NBK538491.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK538491/",
  verified: true,
};

const sesackGraceReward: AnatomySource = {
  citation:
    "Sesack SR, Grace AA. Cortico-Basal Ganglia Reward Network: Microcircuitry. Neuropsychopharmacology. 2010;35(1):27-47. PMC2879005.",
  href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2879005/",
  verified: true,
};

const naccLimbicIntegration: AnatomySource = {
  citation:
    "Floresco SB. Limbic and cortical information processing in the nucleus accumbens. Front Behav Neurosci / PMC2884964.",
  href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2884964/",
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

/**
 * Educational sheets for atlas organs of the central nervous system.
 * Illustrations are didactic highlights, not primary histological references.
 */
const centralNervousEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "brain-prefrontal-cortex",
    location:
      "Porción anterior del lóbulo frontal de cada hemisferio cerebral, por delante de la corteza motora.",
    anatomy:
      "La corteza prefrontal es la región más anterior de la corteza del lóbulo frontal. Incluye divisiones dorsolaterales, ventromediales y orbitarias, con capas de neuronas corticales densamente conectadas entre sí y con el resto del encéfalo. No es una estructura única homogénea: sus subregiones difieren en conexiones y papel funcional.",
    physiology:
      "Participa en funciones ejecutivas como planificación, memoria de trabajo, control de impulsos y toma de decisiones en contextos sociales. Integra información sensorial, emocional y contextual, pero no es el único sustrato de esas capacidades: otras cortezas y redes subcorticales también intervienen.",
    relations:
      "Se conecta de forma recíproca con el tálamo, el hipocampo, la amígdala y circuitos de los ganglios basales, incluidos el núcleo accumbens. Envía proyecciones hacia el área tegmental ventral y recibe señales moduladoras desde el mesencéfalo. Esas vías permiten acoplar planes corticales con valoración afectiva y contexto.",
    sources: [statPearlsPrefrontal, openStaxCns, sesackGraceReward],
  },
  {
    organId: "brain-hippocampus",
    location:
      "Formación en la cara medial del lóbulo temporal, a lo largo del asta inferior del ventrículo lateral.",
    anatomy:
      "El hipocampo es una elevación de sustancia gris dentro del giro parahipocampal. Forma parte de la formación hipocampal junto con el giro dentado y el subículo, y se organiza en campos CA1–CA4. Su aspecto curvo recuerda un caballito de mar; se describen cabeza, cuerpo y cola a lo largo del eje anteroposterior.",
    physiology:
      "Interviene en la consolidación de memorias declarativas y en la representación espacial y contextual. No almacena en solitario todo el recuerdo a largo plazo: trabaja con la corteza entorrinal y otras áreas neocorticales. Lesiones bilaterales extensas se asocian sobre todo a amnesia anterógrada.",
    relations:
      "Recibe aferencias de la corteza entorrinal y se relaciona con la amígdala en el polo anterior del lóbulo temporal. Su eferencia principal viaja por el fórnix. El subículo ventral aporta información contextual al núcleo accumbens; el hipocampo no se confunde con la corteza prefrontal ni con la amígdala, aunque coopere con ambas.",
    sources: [statPearlsHippocampus, statPearlsLimbic, sesackGraceReward],
  },
  {
    organId: "brain-amygdala",
    location:
      "Complejo nuclear en el lóbulo temporal medial, bajo el uncus, en el borde anterior de la formación hipocampal.",
    anatomy:
      "La amígdala es un conjunto de núcleos —en torno a una docena— agrupados en conjuntos basolateral, cortical, central y regiones de la amígdala extendida. Tiene forma almendrada y se continúa con corteza periamigdaloide en la superficie del uncus. No es un núcleo único ni una «glándula» de la emoción.",
    physiology:
      "Participa en el procesamiento de respuestas emocionales, en particular del miedo y la ansiedad, y en el condicionamiento asociativo. También contribuye a aspectos de la memoria afectiva y de la toma de decisiones. Esas funciones las comparte con redes corticales y troncoencefálicas; no «genera» sola toda la vida emocional.",
    relations:
      "Se sitúa por delante de la formación hipocampal y del asta inferior del ventrículo lateral. Envía vías por la estría terminal y la vía amigdalófuga ventral hacia hipotálamo, tronco del encéfalo y corteza. La amígdala basolateral aporta influencia afectiva al núcleo accumbens y mantiene diálogos con la corteza prefrontal.",
    sources: [statPearlsAmygdala, statPearlsLimbic, sesackGraceReward],
  },
  {
    organId: "brain-nucleus-accumbens",
    location:
      "Porción ventral del estriado, bajo el cuerpo del núcleo caudado y alrededor de la comisura anterior, en el cerebro anterior basal.",
    anatomy:
      "El núcleo accumbens forma parte del estriado ventral. Se distingue un núcleo (core) continuo con el estriado dorsal y una corteza (shell) más ventral y medial; también se describe un polo rostral. La gran mayoría de sus neuronas son de proyección espinosas medias, típicas del estriado.",
    physiology:
      "Integra señales limbicocorticales —contexto, afecto y planes— y contribuye a seleccionar conductas motivadas. La dopamina del área tegmental ventral modula esa integración; no actúa como un «centro del placer» aislado. Su salida hacia el pálido ventral enlaza valoración y acción.",
    relations:
      "Recibe aferencias excitadoras de la corteza prefrontal, del subículo ventral del hipocampo y de la amígdala basolateral, además de la inervación dopaminérgica mesencefálica. Proyecta al pálido ventral y participa en bucles que regresan a la corteza a través del tálamo. Queda caudal al septum y ventral respecto al caudado-putamen dorsal.",
    sources: [sesackGraceReward, naccLimbicIntegration, openStaxCns],
  },
  {
    organId: "brain-vta",
    location:
      "Región medial del mesencéfalo tegmental, cerca de la sustancia negra y por encima de la región pontina.",
    anatomy:
      "El área tegmental ventral es un territorio del tegmento mesencefálico que aloja, entre otras, neuronas dopaminérgicas del sistema mesocorticolímbico. No es un núcleo compacto como la sustancia negra pars compacta: es una región con límites difusos y varios tipos celulares, incluidos interneurones y proyecciones no dopaminérgicas.",
    physiology:
      "Sus neuronas dopaminérgicas contribuyen a señales de predicción y valoración que modulan circuitos del estriado ventral y de la corteza. Esa modulación sesga conductas según contingencias del entorno y estados internos. La VTA no «decide» sola ni equivale a la motivación consciente.",
    relations:
      "Proyecta de forma densa al núcleo accumbens (vía mesolímbica) y también a la corteza prefrontal (vía mesocortical). Recibe entradas excitadoras e inhibidoras de origen cortical, límbico y troncoencefálico. Queda relacionada anatómicamente con la sustancia negra, pero sus territorios de proyección y papeles no son idénticos.",
    sources: [sesackGraceReward, openStaxCns, naccLimbicIntegration],
  },
];

const educationEntries: readonly AnatomyEducationEntry[] = [
  ...respiratoryEducation,
  ...centralNervousEducation,
];

const byOrganId = new Map(educationEntries.map((entry) => [entry.organId, entry]));

export function educationalAnatomy(organId: string): AnatomyEducationEntry | null {
  return byOrganId.get(organId as OrganId) ?? null;
}
