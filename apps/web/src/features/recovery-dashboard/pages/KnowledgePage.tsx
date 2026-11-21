import { KnowledgeBrowser } from "../knowledge/KnowledgeBrowser.js";
import { PUBLIC_KNOWLEDGE_CATALOG } from "../knowledge/public-knowledge-catalog.js";

export function KnowledgePage() {
  return <KnowledgeBrowser catalog={PUBLIC_KNOWLEDGE_CATALOG} />;
}
