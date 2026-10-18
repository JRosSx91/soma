import {
  Compass,
  Home,
  PersonStanding,
  Activity,
  Trophy,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useShellBase } from "../context/ShellBaseContext.js";
import { shellSections } from "../shell-base.js";
import { previewFocus } from "../focus.js";
import { AccountMenu } from "./AccountMenu.js";
import { SomaMark } from "./SomaMark.js";

const icons = {
  inicio: Home,
  recuperacion: Activity,
  explorar: Compass,
  anatomia: PersonStanding,
  logros: Trophy,
} as const;

export function PreviewSidebar() {
  const base = useShellBase();
  const sections = shellSections(base);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-soma-line bg-[#081018]/80 px-3 py-4 backdrop-blur-sm lg:flex">
      <div className="px-2 py-2">
        <SomaMark />
      </div>
      <nav className="mt-6" aria-label="Secciones">
        <ul className="flex flex-col gap-1">
          {sections.map((item) => {
            const Icon = icons[item.id];
            return (
              <li key={item.id}>
                <NavLink
                  to={item.to}
                  end={item.id === "inicio"}
                  className={({ isActive }) =>
                    `${previewFocus} flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-soma-raised text-soma-ink"
                        : "text-soma-ink-secondary hover:bg-soma-surface hover:text-soma-ink"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto flex flex-col gap-2 px-1 pb-2">
        <AccountMenu />
      </div>
    </aside>
  );
}
