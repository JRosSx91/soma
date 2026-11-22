import { projectPublishedKnowledge } from "./knowledge-catalog.js";
import { GENERATED_PUBLIC_KNOWLEDGE_SOURCE } from "./public-knowledge-catalog.generated.js";

/**
 * Deliberately empty public source until scientific records receive an
 * independent `published` decision. Candidate design JSON must never be used
 * as a fallback or imported by this module.
 */
export const PUBLIC_KNOWLEDGE_CATALOG = projectPublishedKnowledge(
  GENERATED_PUBLIC_KNOWLEDGE_SOURCE,
);
