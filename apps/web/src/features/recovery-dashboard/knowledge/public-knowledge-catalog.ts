import { projectPublishedKnowledge } from "./knowledge-catalog.js";
import type { KnowledgeCatalog } from "./knowledge-types.js";

/**
 * Deliberately empty public source until scientific records receive an
 * independent `published` decision. Candidate design JSON must never be used
 * as a fallback or imported by this module.
 */
const PUBLIC_KNOWLEDGE_SOURCE: KnowledgeCatalog = {
  concepts: [],
  relations: [],
  prerequisites: [],
  prerequisitePolicy: {
    blocksAccess: false,
    grantsXp: false,
    incomingAreCumulative: false,
  },
};

export const PUBLIC_KNOWLEDGE_CATALOG = projectPublishedKnowledge(
  PUBLIC_KNOWLEDGE_SOURCE,
);
