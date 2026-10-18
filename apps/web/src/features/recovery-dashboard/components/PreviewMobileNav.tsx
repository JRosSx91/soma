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

const icons = {
  inicio: Home,
  recuperacion: Activity,
  explorar: Compass,
  anatomia: PersonStanding,
  logros: Trophy,
} as const;

export function PreviewMobileNav() {
  const base = useShellBase();
  const sections = shellSections(base);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-soma-line bg-soma-canvas/95 backdrop-blur lg:hidden"
      aria-label="Secciones"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {sections.map((item) => {
          const Icon = icons[item.id];
          return (
            <li key={item.id}>
              <NavLink
                to={item.to}
                end={item.id === "inicio"}
                className={({ isActive }) =>
                  `${previewFocus} flex w-full flex-col items-center gap-1 px-1 py-2.5 text-[10px] ${
                    isActive ? "text-soma-action" : "text-soma-ink-muted"
                  }`
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.mobileLabel}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
