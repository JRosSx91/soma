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

const openStaxStomach: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 23.4, The Stomach.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-4-the-stomach",
  verified: true,
};

const openStaxIntestines: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 23.5, The Small and Large Intestines.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-5-the-small-and-large-intestines",
  verified: true,
};

const openStaxAccessoryDigestive: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 23.6, Accessory Organs in Digestion: The Liver, Pancreas, and Gallbladder.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-6-accessory-organs-in-digestion-the-liver-pancreas-and-gallbladder",
  verified: true,
};

const openStaxMouth: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 23.3, The Mouth, Pharynx, and Esophagus.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-3-the-mouth-pharynx-and-esophagus",
  verified: true,
};

const statPearlsStomach: AnatomySource = {
  citation:
    "Chaudhry SR, Liman MNP, Omole AE, Peterson DC. Anatomy, Abdomen and Pelvis: Stomach. StatPearls, NCBI Bookshelf. Actualización del 17 de julio de 2024. NBK482334.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK482334/",
  verified: true,
};

const statPearlsPancreas: AnatomySource = {
  citation:
    "Talathi SS, Omole AE, Young M. Anatomy, Abdomen and Pelvis, Pancreas. StatPearls, NCBI Bookshelf. NBK532912.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK532912/",
  verified: true,
};

const statPearlsOralMucosa: AnatomySource = {
  citation:
    "Brizuela M, Winters R. Histology, Oral Mucosa. StatPearls, NCBI Bookshelf. Actualización del 8 de mayo de 2023. NBK572115.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK572115/",
  verified: true,
};

const openStaxHeart: AnatomySource = {
  citation: "OpenStax. Anatomy and Physiology 2e. Sección 19.1, Heart Anatomy.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy",
  verified: true,
};

const openStaxKidney: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 25.3, Gross Anatomy of the Kidney.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/25-3-gross-anatomy-of-the-kidney",
  verified: true,
};

const openStaxLymphatic: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 21.1, Anatomy of the Lymphatic and Immune Systems.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/21-1-anatomy-of-the-lymphatic-and-immune-systems",
  verified: true,
};

const openStaxSkin: AnatomySource = {
  citation: "OpenStax. Anatomy and Physiology 2e. Sección 5.1, Layers of the Skin.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/5-1-layers-of-the-skin",
  verified: true,
};

const openStaxSensory: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 14.1, Sensory Perception.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/14-1-sensory-perception",
  verified: true,
};

const openStaxTestes: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 27.1, Anatomy and Physiology of the Testicular Reproductive System.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/27-1-anatomy-and-physiology-of-the-testicular-reproductive-system",
  verified: true,
};

const openStaxOvaries: AnatomySource = {
  citation:
    "OpenStax. Anatomy and Physiology 2e. Sección 27.2, Anatomy and Physiology of the Ovarian Reproductive System.",
  href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/27-2-anatomy-and-physiology-of-the-ovarian-reproductive-system",
  verified: true,
};

const statPearlsHeart: AnatomySource = {
  citation:
    "Rehman I, Rehman A. Anatomy, Thorax, Heart. StatPearls, NCBI Bookshelf. Actualización del 28 de agosto de 2023. NBK470256.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK470256/",
  verified: true,
};

const statPearlsLiver: AnatomySource = {
  citation:
    "Vernon H, Wehrle CJ, Alia VSK, Kasi A. Anatomy, Abdomen and Pelvis: Liver. StatPearls, NCBI Bookshelf. Actualización del 26 de noviembre de 2022. NBK500014.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK500014/",
  verified: true,
};

const statPearlsKidneys: AnatomySource = {
  citation:
    "Garza FA, Leslie SW. Anatomy, Abdomen and Pelvis: Kidneys. StatPearls, NCBI Bookshelf. Actualización del 15 de septiembre de 2025. NBK482385.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK482385/",
  verified: true,
};

const statPearlsSpleen: AnatomySource = {
  citation:
    "Anatomy, Abdomen and Pelvis, Spleen. StatPearls, NCBI Bookshelf. NBK482235.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK482235/",
  verified: true,
};

const statPearlsTestes: AnatomySource = {
  citation:
    "Tiwana MS, Leslie SW. Anatomy, Abdomen and Pelvis: Testes. StatPearls, NCBI Bookshelf. Actualización del 15 de abril de 2023. NBK470201.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK470201/",
  verified: true,
};

const statPearlsOvary: AnatomySource = {
  citation:
    "Gibson E, Mahdy H. Anatomy, Abdomen and Pelvis, Ovary. StatPearls, NCBI Bookshelf. Actualización del 24 de julio de 2023. NBK545187.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK545187/",
  verified: true,
};

const statPearlsSkin: AnatomySource = {
  citation:
    "Anatomy, Skin (Integument). StatPearls, NCBI Bookshelf. NBK441980.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK441980/",
  verified: true,
};

const statPearlsTeeth: AnatomySource = {
  citation:
    "Anatomy, Head and Neck, Teeth. StatPearls, NCBI Bookshelf. NBK557543.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK557543/",
  verified: true,
};

const statPearlsEye: AnatomySource = {
  citation:
    "Anatomy, Head and Neck, Eye. StatPearls, NCBI Bookshelf. NBK482428.",
  href: "https://www.ncbi.nlm.nih.gov/books/NBK482428/",
  verified: true,
};

const respiratoryEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "lungs",
    location:
      "En la cavidad torácica, a ambos lados del mediastino, dentro de la caja costal y apoyados sobre el diafragma.",
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
    location:
      "Desde la carina traqueal, en el mediastino, hasta el hilio de cada pulmón, donde continúan el árbol bronquial intrapulmonar.",
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
    location:
      "Reviste las paredes de la cavidad nasal, desde las narinas hasta la nasofaringe, incluidas las superficies de los cornetes.",
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

/**
 * Educational sheets for atlas organs of the digestive system.
 * Illustrations are didactic highlights, not primary histological references.
 */
const digestiveEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "stomach",
    location:
      "En el hemiabdomen superior, mayormente a la izquierda de la línea media, entre el esófago por arriba y el duodeno por abajo.",
    anatomy:
      "El estómago es la porción más dilatada del tubo digestivo. Se describen cardias (unión esofágica), fundus (cúpula superior), cuerpo (región principal) y píloro (antro y canal que desembocan en el duodeno a través del esfínter pilórico). La pared presenta mucosa, submucosa, muscularis externa —con capas longitudinal, circular y una oblicua interna típica del estómago— y serosa. La mucosa gástrica forma pliegues (rugae) y aloja glándulas que secretan ácido, pepsinógeno, moco y factor intrínseco.",
    physiology:
      "Actúa como reservorio temporal y cámara de mezcla: las ondas de contracción trituran el alimento y lo convierten en quimo. La secreción gástrica aporta ácido clorhídrico y pepsinógeno para iniciar la digestión de proteínas; el factor intrínseco es necesario para la absorción ulterior de vitamina B12. El vaciamiento hacia el duodeno está regulado por el píloro y por señales del intestino proximal. La absorción de nutrientes en el estómago es mínima.",
    relations:
      "Recibe el bolo desde el esófago y entrega quimo al duodeno. La curvatura menor se relaciona con el omento menor hacia el hígado; la mayor, con el omento mayor. Queda por delante del páncreas y se acopla funcionalmente a la secreción pancreática y biliar cuando el quimo llega al intestino delgado.",
    sources: [openStaxStomach, statPearlsStomach],
  },
  {
    organId: "pancreas",
    location:
      "Glándula retroperitoneal en el abdomen superior, transversal entre el asa en C del duodeno a la derecha y el hilio esplénico a la izquierda, por detrás del estómago.",
    anatomy:
      "Se divide en cabeza (alojada en la curvatura duodenal), cuello, cuerpo y cola. La mayor parte del tejido es exocrino: acinos que drenan hacia el conducto pancreático principal, el cual suele unirse al conducto biliar común en la ampolla hepatopancreática antes de abrir en el duodeno. Dispersos entre los acinos hay islotes pancreáticos (de Langerhans), el componente endocrino. No es un órgano del tubo digestivo propiamente dicho, sino una glándula accesoria.",
    physiology:
      "La secreción exocrina aporta enzimas digestivas (amilasa, lipasa, proteasas en forma de zimógenos) y bicarbonato, que neutraliza el quimo ácido y crea un entorno adecuado en el intestino delgado. Los islotes liberan a la sangre hormonas como insulina y glucagón, que regulan el metabolismo de la glucosa. Ambas funciones coexisten en la misma glándula sin confundirse con la digestión mecánica del estómago ni con la absorción intestinal.",
    relations:
      "La cabeza se apoya en el duodeno; la cola se acerca al bazo. El jugo pancreático y la bilis convergen hacia el duodeno, donde actúan sobre el quimo procedente del estómago. Queda por detrás del estómago y en relación estrecha con vasos mesentéricos superiores en el cuello de la glándula.",
    sources: [openStaxAccessoryDigestive, statPearlsPancreas],
  },
  {
    organId: "intestines",
    location:
      "Ocupan gran parte de la cavidad abdominal, desde el píloro hasta el canal anal: intestino delgado en el centro y intestino grueso formando un marco periférico.",
    anatomy:
      "El intestino delgado comprende duodeno, yeyuno e íleon; su mucosa aumenta la superficie con pliegues, vellosidades y microvellosidades. El intestino grueso incluye ciego (con apéndice), colon (ascendente, transverso, descendente y sigmoide) y recto; muestra haustras y tenias coli. Ambos segmentos comparten la arquitectura general del tubo digestivo (mucosa, submucosa, muscular y serosa o adventicia), con especializaciones regionales. En este atlas figuran juntos como «Intestinos», sin órganos separados para delgado y grueso.",
    physiology:
      "En el intestino delgado termina la digestión enzimática y ocurre la mayor parte de la absorción de nutrientes, agua y electrolitos. El intestino grueso reabsorbe agua y electrolitos restantes, compacta el residuo y aloja una microbiota que participa en la fermentación de material no digerido y en la síntesis de algunas vitaminas. La motilidad (segmentación, peristalsis y movimientos en masa) desplaza el contenido a lo largo de ambos tramos.",
    relations:
      "El duodeno recibe quimo del estómago y secreciones del páncreas y de la vía biliar. El íleon desemboca en el ciego por la válvula ileocecal. El mesenterio y el mesocolon fijan asas a la pared posterior y llevan vasos y nervios. La mucosa oral y el estómago preparan el bolo antes de que llegue a este tramo; el hígado procesa muchos de los nutrientes absorbidos vía vena porta.",
    sources: [openStaxIntestines, openStaxAccessoryDigestive],
  },
  {
    organId: "oral-mucosa",
    location:
      "Revestimiento húmedo de la cavidad oral, desde la mucosa labial hasta los pliegues palatofaríngeos, cubriendo mejillas, suelo de la boca, encía y paladar.",
    anatomy:
      "Está formada por un epitelio escamoso estratificado sobre una lámina propia de tejido conjuntivo; en muchas regiones hay también submucosa. Se distinguen mucosa de revestimiento (no queratinizada, en zonas móviles como mejillas y suelo de la boca), mucosa masticatoria (queratinizada o paraqueratinizada, en encía adherida y paladar duro) y mucosa especializada en el dorso de la lengua, con papilas. No es el diente, ni las glándulas salivales mayores, ni el conjunto del aparato bucal: es la membrana mucosa que los rodea y protege.",
    physiology:
      "Actúa como barrera mecánica, química y microbiana frente al medio oral. Permite sensibilidad táctil, térmica y dolorosa, y en la mucosa especializada contribuye a la percepción del gusto a través de las papilas. Su permeabilidad y queratinización varían según la región, adaptándose al roce de la masticación o a la movilidad de mejillas y labios.",
    relations:
      "Limita con los dientes en la encía y con la orofaringe hacia atrás. Las secreciones salivales la humedecen, pero las glándulas salivales son órganos distintos. Continúa hacia el esófago a través de la faringe; el bolo masticado pasa luego al estómago. No se confunde con la mucosa nasal, que reviste la cavidad nasal.",
    sources: [statPearlsOralMucosa, openStaxMouth],
  },
];

const cardiovascularEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "heart",
    location:
      "En el mediastino medio, detrás del esternón y entre los pulmones, ligeramente inclinado hacia la izquierda.",
    anatomy:
      "El corazón es un órgano muscular hueco con cuatro cámaras: atrios derecho e izquierdo y ventrículos derecho e izquierdo. El miocardio forma la pared contráctil; el endocardio reviste el interior y el epicardio forma la capa visceral del pericardio. Válvulas auriculoventriculares (tricúspide y mitral) y semilunares (pulmonar y aórtica) orientan el flujo. El tabique interatrial e interventricular separa las mitades derecha e izquierda.",
    physiology:
      "Actúa como bomba doble: el lado derecho envía sangre desoxigenada a la circulación pulmonar y el izquierdo impulsa sangre oxigenada a la circulación sistémica. El ciclo cardíaco alterna contracción (sístole) y relajación (diástole). El nódulo sinusal inicia el impulso eléctrico que se propaga por el sistema de conducción; no sustituye la regulación hormonal ni el tono vascular periférico.",
    relations:
      "Recibe retorno venoso por las venas cavas y el seno coronario hacia el atrio derecho, y por las venas pulmonares hacia el atrio izquierdo. Expulsa sangre por la arteria pulmonar y la aorta. Las arterias coronarias irrigan el propio miocardio. Queda relacionado anatómicamente con pericardio, diafragma y grandes vasos del mediastino.",
    sources: [openStaxHeart, statPearlsHeart],
  },
];

const hepaticEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "liver",
    location:
      "En el cuadrante superior derecho del abdomen, bajo el diafragma, mayormente intraperitoneal salvo el área desnuda posterior.",
    anatomy:
      "El hígado es la glándula más voluminosa del cuerpo. Se describen lóbulos anatómicos derecho e izquierdo, más caudado y cuadrado; la división funcional en segmentos sigue la irrigación portal y hepática. El parénquima se organiza en lobulillos con hepatocitos alrededor de una vena central, sinusoides y tríadas portales (rama de la arteria hepática, vena porta y conducto biliar). La bilis fluye por canalículos hacia los conductos hepáticos.",
    physiology:
      "Procesa nutrientes absorbidos en el intestino, sintetiza proteínas plasmáticas, almacena glucógeno y regula aspectos del metabolismo lipídico. Detoxifica y transforma muchos compuestos antes de devolverlos a la sangre o excretarlos en la bilis. Produce bilis para emulsionar lípidos en el intestino delgado. No digiere el bolo como el estómago ni filtra la sangre como el riñón.",
    relations:
      "Recibe sangre oxigenada por la arteria hepática y sangre rica en nutrientes por la vena porta. Drena hacia las venas hepáticas y la cava inferior. Se relaciona con la vesícula biliar y el conducto biliar común, que desembocan en el duodeno junto con el jugo pancreático. El ligamento falciforme y el omento menor lo fijan a la pared y al estómago.",
    sources: [openStaxAccessoryDigestive, statPearlsLiver],
  },
];

const renalEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "kidneys",
    location:
      "Órganos pares retroperitoneales a ambos lados de la columna, aproximadamente entre T12 y L3; el derecho suele quedar algo más bajo por el hígado.",
    anatomy:
      "Cada riñón presenta corteza externa y médula con pirámides renales. El hilio medial da paso a vasos, nervios y uréter. La unidad funcional es el nefrón: corpúsculo renal (glomérulo y cápsula de Bowman) y túbulo (proximal, asa de Henle, distal) que desemboca en conductos colectores. La orina se recoge en cálices y pelvis renal antes del uréter.",
    physiology:
      "Filtran la sangre plasmática en el glomérulo y reabsorben o secretan solutos y agua a lo largo del túbulo, regulando volumen extracelular, electrolitos y equilibrio ácido-base. Excretan residuos nitrogenados y participan en la presión arterial mediante el aparato yuxtaglomerular. También producen eritropoyetina y contribuyen a la activación de vitamina D. No realizan intercambio gaseoso ni digestión enzimática.",
    relations:
      "Las arterias renales nacen de la aorta; las venas renales drenan a la cava inferior. Cada riñón se continúa con un uréter hacia la vejiga. Las glándulas suprarrenales se asientan en el polo superior, pero son órganos endocrinos distintos. El riñón izquierdo se relaciona con bazo, estómago y cola del páncreas; el derecho, con el hígado y el duodeno.",
    sources: [openStaxKidney, statPearlsKidneys],
  },
];

const immuneEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "spleen",
    location:
      "En el hipocondrio izquierdo, entre el diafragma y el fundus gástrico, protegido aproximadamente por las costillas 9 a 11.",
    anatomy:
      "El bazo es el mayor órgano del sistema linfático. Tiene cápsula fibrosa, hilio vascular y parénquima dividido en pulpa blanca (vainas linfoides periarteriolares y folículos) y pulpa roja (cuerdas de Billroth y sinusoides venosos), separadas por una zona marginal. No es un ganglio linfático ni un órgano del tubo digestivo.",
    physiology:
      "Filtra la sangre: elimina eritrocitos envejecidos o dañados y captura antígenos circulantes. La pulpa blanca inicia respuestas inmunitarias adaptativas frente a patógenos sanguíneos. También puede secuestrar plaquetas y otros elementos formes. No sintetiza bilis ni orina.",
    relations:
      "La arteria esplénica llega desde el tronco celíaco; la vena esplénica contribuye a formar la vena porta. Ligamentos esplenorrenal y gastrosplénico lo fijan. Se relaciona con estómago, riñón izquierdo, flexura cólica izquierda y cola del páncreas. Cooperación inmunitaria con ganglios y tejido linfoide mucoso, sin confundirse con ellos.",
    sources: [openStaxLymphatic, statPearlsSpleen],
  },
];

const reproductiveEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "testes",
    location:
      "En el escroto, fuera de la cavidad pélvica, suspendidos por el cordón espermático; el izquierdo suele quedar algo más bajo.",
    anatomy:
      "Cada testículo es una gónada oval revestida por túnica albugínea. El parénquima se organiza en lóbulos con túbulos seminíferos, donde se produce la espermatogénesis. Entre los túbulos hay células de Leydig. El epidídimo se adosa al borde posterior. No incluye próstata ni vesículas seminales, que son glándulas accesorias distintas.",
    physiology:
      "Función exocrina: producir espermatozoides. Función endocrina: sintetizar testosterona y otras hormonas sexuales que mantienen caracteres sexuales secundarios y regulan, por retroalimentación, el eje hipotálamo-hipófisis. La maduración espermática continúa en el epidídimo. No equivale a todo el aparato reproductor masculino.",
    relations:
      "El cordón espermático lleva vasos, nervios y el conducto deferente hacia la pelvis. Se relaciona con el epidídimo y, vía deferente, con las vías eyaculadoras. Temperatura escrotal más baja que la corporal favorece la espermatogénesis. En Soma el órgano canónico es el testículo, no el escroto ni las glándulas accesorias.",
    sources: [openStaxTestes, statPearlsTestes],
  },
  {
    organId: "ovaries",
    location:
      "Pares, en la cavidad pélvica dentro de la fosa ovárica, cerca del extremo distal de cada trompa uterina.",
    anatomy:
      "Cada ovario presenta epitelio superficial, túnica albugínea, corteza con folículos en distintos estadios y médula vascular en el hilio. Es una gónada intraperitoneal unida por el mesovario y el ligamento suspensorio. No incluye útero ni trompas como parte del mismo órgano canónico.",
    physiology:
      "Produce ovocitos mediante foliculogénesis y ovulación, y secreta estrógenos, progesterona e inhibina según la fase del ciclo. Tras la ovulación, el cuerpo lúteo mantiene progesterona si hay señal adecuada; si no, degenera. Esas hormonas actúan sobre endometrio, mama y eje hipotálamo-hipófisis. No gestiona por sí solo la implantación ni el embarazo.",
    relations:
      "El ovocito ovulado es captado por la trompa uterina. El ligamento suspensorio lleva vasos ováricos. Se relaciona con útero, trompas y peritoneo pélvico. Funcionalmente acoplado al ciclo menstrual y, en embarazo, a la transición hormonal hacia la placenta, sin confundirse con ella.",
    sources: [openStaxOvaries, statPearlsOvary],
  },
];

const integumentaryEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "skin",
    location:
      "Cubre toda la superficie externa del cuerpo y se continúa con mucosas en orificios naturales (labios, narinas, ano, genitales).",
    anatomy:
      "La piel comprende epidermis (epitelio escamoso estratificado queratinizado, con estratos desde basal hasta córneo), dermis (papilar y reticular, con colágeno, vasos y anexos) e hipodermis o tejido subcutáneo. Los anexos —folículos pilosos, glándulas sudoríparas y sebáceas— se originan en la epidermis pero se alojan en dermis. El grosor y la queratinización varían por región.",
    physiology:
      "Barrera frente a microorganismos, deshidratación, traumatismos y radiación ultravioleta. Participa en termorregulación (vasos y sudor), sensibilidad (receptores cutáneos), síntesis inicial de vitamina D y vigilancia inmunitaria local. No es mucosa oral ni nasal: esas membranas húmedas tienen fichas propias.",
    relations:
      "Se continua con mucosas en las uniones mucocutáneas. Irrigación e inervación cutáneas la conectan con sistemas cardiovascular y nervioso. Los anexos y el tejido subcutáneo forman parte del sistema tegumentario en sentido amplio; en este atlas el órgano canónico «Piel» designa el órgano cutáneo, distinto de «Dientes».",
    sources: [openStaxSkin, statPearlsSkin],
  },
  {
    organId: "teeth",
    location:
      "Fijos en los procesos alveolares del maxilar y la mandíbula, dentro de la cavidad oral.",
    anatomy:
      "Cada diente tiene corona (visible, cubierta de esmalte) y raíz (en el hueso alveolar, cubierta de cemento), unidas en la unión cementoesmalte. La dentina forma el núcleo alrededor de la pulpa neurovascular. Humanos son heterodonto (incisivos, caninos, premolares y molares) y difiodonto (dentición temporal y permanente). No son mucosa oral: la encía y el resto de la mucosa tienen su propia ficha.",
    physiology:
      "Cortan, desgarran y muelen el alimento; también intervienen en el habla y en la morfología facial. El periodonto (ligamento periodontal, cemento y hueso alveolar) ancla el diente y amortigua fuerzas. La pulpa aporta inervación y vascularización. No digieren químicamente el bolo: esa digestión continúa en estómago e intestino.",
    relations:
      "Se relacionan con la mucosa oral en la encía y con las glándulas salivales que humedecen la cavidad. El bolo masticado pasa a faringe y esófago. En el catálogo Soma, «Dientes» pertenece al sistema tegumentario junto a la piel; no sustituye la ficha de mucosa oral.",
    sources: [openStaxMouth, statPearlsTeeth],
  },
];

const sensoryEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "eyes",
    location:
      "En las órbitas óseas del cráneo, protegidos por párpados, conjuntiva y aparato lagrimal.",
    anatomy:
      "El globo ocular tiene tres capas: fibrosa (córnea y esclerótica), vascular (coroides, cuerpo ciliar e iris) y neural (retina). El humor acuoso, el cristalino y el humor vítreo completan el aparato óptico. La retina contiene fotoreceptores y neuronas que forman el nervio óptico. No incluye la corteza visual ni el oído.",
    physiology:
      "Enfoca la luz sobre la retina, donde fotoreceptores convierten el estímulo en señales nerviosas. El iris regula la entrada de luz; el cristalino acomoda la distancia focal. Las vías ópticas llevan la información al cerebro para la percepción visual. El ojo no interpreta por sí solo el significado de lo visto: eso requiere procesamiento central.",
    relations:
      "Músculos extrínsecos mueven el globo en la órbita. Nervios craneales (sobre todo II, III, IV y VI) lo conectan con el tronco del encéfalo. La circulación retinal y uveal nutre las capas internas. Cooperación con párpados y lágrimas para protección; distinto del sistema nervioso central, aunque sus vías terminen en él.",
    sources: [openStaxSensory, statPearlsEye],
  },
];

const educationEntries: readonly AnatomyEducationEntry[] = [
  ...respiratoryEducation,
  ...centralNervousEducation,
  ...digestiveEducation,
  ...cardiovascularEducation,
  ...hepaticEducation,
  ...renalEducation,
  ...immuneEducation,
  ...reproductiveEducation,
  ...integumentaryEducation,
  ...sensoryEducation,
];

const byOrganId = new Map(educationEntries.map((entry) => [entry.organId, entry]));

export function educationalAnatomy(organId: string): AnatomyEducationEntry | null {
  return byOrganId.get(organId as OrganId) ?? null;
}
