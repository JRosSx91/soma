import { useEffect, useRef } from "react";
import {
  Compass,
  Home,
  PersonStanding,
  Activity,
  Trophy,
  PanelLeftClose,
  PanelLeftOpen,
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
  const { collapsed, mobileOpen, toggleCollapsed, setMobileOpen } =
    useShellLayout();
  const sections = shellSections(base);
  const asideRef = useRef<HTMLElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const firstLink = asideRef.current?.querySelector("a");
    if (firstLink instanceof HTMLElement) firstLink.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus();
    };
  }, [mobileOpen, setMobileOpen]);

  const nav = (
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
                onClick={() => setMobileOpen(false)}
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
  );

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label={t("shell.closeNav")}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        ref={asideRef}
        id="soma-shell-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-soma-line bg-[#081018]/95 px-3 py-4 backdrop-blur-sm transition-[width,transform] duration-200 ease-out motion-reduce:transition-none ${
          collapsed ? "lg:w-[4.5rem]" : "lg:w-60"
        } ${
          mobileOpen
            ? "w-60 translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className={`flex items-center gap-2 px-2 py-2 ${
            collapsed ? "lg:flex-col lg:justify-center lg:px-0" : ""
          }`}
        >
          <SomaMark compact={collapsed} />
          <button
            type="button"
            className={`${previewFocus} hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-soma-ink-secondary hover:bg-soma-surface hover:text-soma-ink lg:flex`}
            aria-pressed={collapsed}
            aria-label={
              collapsed ? t("shell.expandNav") : t("shell.collapseNav")
            }
            title={collapsed ? t("shell.expandNav") : t("shell.collapseNav")}
            onClick={toggleCollapsed}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
          </button>
        </div>
        {nav}
      </aside>
    </>
  );
}
