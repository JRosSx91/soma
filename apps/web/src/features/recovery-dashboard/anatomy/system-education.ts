import type { BodySystem } from "@soma/shared-types";
import type { AnatomySource } from "./anatomy-education.ts";

/**
 * Identity and bibliography for atlas systems that have no canonical organs.
 * Visible copy lives in i18n (`anatomy.education.systems.<systemId>`).
 * A missing system returns null. It does not invent OrganId entries.
 */

export interface SystemEducationEntry {
  systemId: BodySystem;
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
    sources: [openStaxEndocrineOverview, statPearlsHypothalamus, statPearlsPituitary],
  },
  {
    systemId: "nervous-peripheral",
    sources: [openStaxPns, openStaxAns, statPearlsAns, statPearlsSomatic],
  },
];

const bySystemId = new Map(
  systemEducationEntries.map((entry) => [entry.systemId, entry]),
);

export function educationalSystem(systemId: string): SystemEducationEntry | null {
  return bySystemId.get(systemId as BodySystem) ?? null;
}
