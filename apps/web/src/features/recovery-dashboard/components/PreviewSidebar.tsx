import {
  Compass,
  Home,
  PersonStanding,
  Settings,
  Activity,
  Trophy,
  User,
} from "lucide-react";
import type { PreviewSectionId } from "../demo-data.js";
import { previewSections } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import { SomaMark } from "./SomaMark.js";

interface PreviewSidebarProps {
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

export function PreviewSidebar({ section, onSection }: PreviewSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-soma-line bg-[#081018]/80 px-3 py-4 backdrop-blur-sm lg:flex">
      <div className="px-2 py-2">
        <SomaMark />
      </div>
      <nav className="mt-6" aria-label="Secciones">
        <ul className="flex flex-col gap-1">
          {previewSections.map((item) => {
            const Icon = icons[item.id];
            const current = item.id === section;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSection(item.id)}
                  aria-current={current ? "page" : undefined}
                  className={`${previewFocus} flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    current
                      ? "bg-soma-raised text-soma-ink"
                      : "text-soma-ink-secondary hover:bg-soma-surface hover:text-soma-ink"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto flex flex-col gap-2 px-1 pb-2">
        <button
          type="button"
          className={`${previewFocus} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-soma-ink-secondary transition-colors hover:bg-soma-surface hover:text-soma-ink`}
          title="Disponible en una fase posterior"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Configuración
        </button>
        <button
          type="button"
          className={`${previewFocus} flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-soma-ink-secondary transition-colors hover:bg-soma-surface hover:text-soma-ink`}
          title="Disponible en una fase posterior"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-soma-surface text-soma-ink">
            <User className="h-4 w-4" aria-hidden="true" />
          </span>
          Cuenta
        </button>
      </div>
    </aside>
  );
}
