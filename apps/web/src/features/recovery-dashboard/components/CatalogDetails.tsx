import type { ReactNode } from "react";
import { previewFocus } from "../focus.js";

interface CatalogDetailsProps {
  summary: string;
  children: ReactNode;
}

/**
 * Accessible expandable catalog block. Same pattern as the atlas Effects
 * details: native <details>/<summary>, keyboard-operable.
 */
export function CatalogDetails({ summary, children }: CatalogDetailsProps) {
  return (
    <details className="rounded-xl border border-soma-line bg-soma-canvas/30 px-3 py-2">
      <summary className={`${previewFocus} cursor-pointer text-xs font-medium text-soma-ink`}>
        {summary}
      </summary>
      <div className="mt-2 space-y-2">{children}</div>
    </details>
  );
}
