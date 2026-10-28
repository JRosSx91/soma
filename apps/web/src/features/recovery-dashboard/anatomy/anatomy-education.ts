import type { OrganId } from "@soma/shared-types";

/**
 * Identity and bibliography for atlas organ fichas.
 * Visible location, anatomy, physiology and relations live in i18n
 * (`anatomy.education.organs.<organId>`). A missing organ returns null.
 * It does not borrow another organ's text.
 */

export interface AnatomySource {
  citation: string;
  href: string;
  /** True only when this session checked the cited page against the wording. */
  verified: boolean;
}

export interface AnatomyEducationEntry {
  organId: OrganId;
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
    sources: [openStaxRespiratory, ntuAirBloodBarrier],
  },
  {
    organId: "bronchi",
    sources: [openStaxRespiratory, kenhubLowerAirway],
  },
  {
    organId: "nasal-mucosa",
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
    sources: [statPearlsPrefrontal, openStaxCns, sesackGraceReward],
  },
  {
    organId: "brain-hippocampus",
    sources: [statPearlsHippocampus, statPearlsLimbic, sesackGraceReward],
  },
  {
    organId: "brain-amygdala",
    sources: [statPearlsAmygdala, statPearlsLimbic, sesackGraceReward],
  },
  {
    organId: "brain-nucleus-accumbens",
    sources: [sesackGraceReward, naccLimbicIntegration, openStaxCns],
  },
  {
    organId: "brain-vta",
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
    sources: [openStaxStomach, statPearlsStomach],
  },
  {
    organId: "pancreas",
    sources: [openStaxAccessoryDigestive, statPearlsPancreas],
  },
  {
    organId: "intestines",
    sources: [openStaxIntestines, openStaxAccessoryDigestive],
  },
  {
    organId: "oral-mucosa",
    sources: [statPearlsOralMucosa, openStaxMouth],
  },
];

const cardiovascularEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "heart",
    sources: [openStaxHeart, statPearlsHeart],
  },
];

const hepaticEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "liver",
    sources: [openStaxAccessoryDigestive, statPearlsLiver],
  },
];

const renalEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "kidneys",
    sources: [openStaxKidney, statPearlsKidneys],
  },
];

const immuneEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "spleen",
    sources: [openStaxLymphatic, statPearlsSpleen],
  },
];

const reproductiveEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "testes",
    sources: [openStaxTestes, statPearlsTestes],
  },
  {
    organId: "ovaries",
    sources: [openStaxOvaries, statPearlsOvary],
  },
];

const integumentaryEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "skin",
    sources: [openStaxSkin, statPearlsSkin],
  },
  {
    organId: "teeth",
    sources: [openStaxMouth, statPearlsTeeth],
  },
];

const sensoryEducation: readonly AnatomyEducationEntry[] = [
  {
    organId: "eyes",
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
