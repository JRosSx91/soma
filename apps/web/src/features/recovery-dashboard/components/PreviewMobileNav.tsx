import {
  Compass,
  Home,
  PersonStanding,
  Activity,
  Trophy,
} from "lucide-react";
import type { PreviewSectionId } from "../demo-data.js";
import { previewSections } from "../demo-data.js";
import { previewFocus } from "../focus.js";

interface PreviewMobileNavProps {
  section: PreviewSectionId;
  onSection: (section: PreviewSectionId) => void;
}

const icons = {
  inicio: Home,
  recuperacion: Activity,
  explorar: Compass,
  anatomia: PersonStanding,
  logros: Trophy,
} as const;

export function PreviewMobileNav({ section, onSection }: PreviewMobileNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-soma-line bg-soma-canvas/95 backdrop-blur lg:hidden"
      aria-label="Secciones"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {previewSections.map((item) => {
          const Icon = icons[item.id];
          const current = item.id === section;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSection(item.id)}
                aria-current={current ? "page" : undefined}
                className={`${previewFocus} flex w-full flex-col items-center gap-1 px-1 py-2.5 text-[10px] ${
                  current ? "text-soma-action" : "text-soma-ink-muted"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.mobileLabel}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
