import {
  Compass,
  Home,
  PersonStanding,
  Activity,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShellBase } from "../context/ShellBaseContext.js";
import { useShellLayout } from "../hooks/useShellLayout.js";
import { shellSections } from "../shell-base.js";
import { previewFocus } from "../focus.js";
import { SomaMark } from "./SomaMark.js";

const icons = {
  inicio: Home,
  recuperacion: Activity,
  explorar: Compass,
  anatomia: PersonStanding,
  logros: Trophy,
} as const;

export function PreviewSidebar() {
  const { t } = useTranslation("common");
  const base = useShellBase();
  const { collapsed, toggleCollapsed } = useShellLayout();
  const sections = shellSections(base);

  return (
    <aside
      id="soma-shell-sidebar"
      className={`fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-soma-line/40 bg-[#081018]/95 px-3 py-4 backdrop-blur-sm transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex ${
        collapsed ? "lg:w-[4.5rem]" : "lg:w-60"
      }`}
    >
      <div
        className={`flex items-center py-2 ${
          collapsed ? "justify-center gap-0.5 px-0" : "gap-1 px-2"
        }`}
      >
        <SomaMark compact={collapsed} />
        <button
          type="button"
          className={`${previewFocus} flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-soma-ink-muted hover:bg-soma-surface hover:text-soma-ink`}
          aria-pressed={collapsed}
          aria-label={collapsed ? t("shell.expandNav") : t("shell.collapseNav")}
          title={collapsed ? t("shell.expandNav") : t("shell.collapseNav")}
          onClick={toggleCollapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </div>
      <nav className="mt-6" aria-label={t("shell.navAria")}>
        <ul className="flex flex-col gap-1">
          {sections.map((item) => {
            const Icon = icons[item.id];
            const label = t(`shell.${item.labelKey}`);
            return (
              <li key={item.id}>
                <NavLink
                  to={item.to}
                  end={item.id === "inicio"}
                  title={collapsed ? label : undefined}
                  aria-label={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `${previewFocus} flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      collapsed ? "lg:justify-center lg:px-0" : ""
                    } ${
                      isActive
                        ? "bg-soma-raised text-soma-ink"
                        : "text-soma-ink-secondary hover:bg-soma-surface hover:text-soma-ink"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className={collapsed ? "lg:sr-only" : undefined}>
                    {label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
