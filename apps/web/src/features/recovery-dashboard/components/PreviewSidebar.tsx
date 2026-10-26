import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../../../components/LanguageSelector.js";
import { AchievementInboxBell } from "../../achievements/components/AchievementInboxBell.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { useShellLayout } from "../hooks/useShellLayout.js";
import { desktopShellSections } from "../shell-base.js";
import { shellNavActiveClass, shellNavIdleClass } from "../shell-chrome.js";
import { shellIcons } from "../shell-icons.js";
import { previewFocus } from "../focus.js";
import { AccountMenu } from "./AccountMenu.js";
import { SomaMark } from "./SomaMark.js";

export function PreviewSidebar() {
  const { t } = useTranslation("common");
  const base = useShellBase();
  const { collapsed, toggleCollapsed } = useShellLayout();
  const sections = desktopShellSections(base);
  const collapseLabel = collapsed ? t("shell.expandNav") : t("shell.collapseNav");

  return (
    <aside
      id="soma-shell-sidebar"
      className={`fixed inset-y-0 left-0 z-50 hidden flex-col overflow-visible border-r border-soma-line/30 bg-soma-shell-rail/95 py-4 backdrop-blur-sm transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex ${
        collapsed ? "lg:w-[4.5rem]" : "lg:w-60"
      }`}
    >
      <div className="relative h-12 shrink-0">
        <div
          className={`flex h-full items-center ${
            collapsed ? "w-full justify-center" : "justify-between px-4"
          }`}
        >
          <SomaMark compact={collapsed} expeditions />
          {collapsed ? null : (
            <button
              type="button"
              className={`${previewFocus} flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-soma-ink-muted hover:bg-soma-surface hover:text-soma-ink`}
              aria-pressed={collapsed}
              aria-label={collapseLabel}
              title={collapseLabel}
              onClick={toggleCollapsed}
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
        {collapsed ? (
          <button
            type="button"
            className={`${previewFocus} absolute top-1/2 right-0 z-10 flex h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-soma-line/50 bg-soma-shell-rail text-soma-ink-muted hover:bg-soma-surface hover:text-soma-ink`}
            aria-pressed={collapsed}
            aria-label={collapseLabel}
            title={collapseLabel}
            onClick={toggleCollapsed}
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mx-3 mt-4 h-px bg-gradient-to-r from-transparent via-soma-shell-accent/25 to-transparent" />

      <nav className="mt-4 px-3" aria-label={t("shell.navAria")}>
        <ul className="flex flex-col gap-1">
          {sections.map((item) => {
            const Icon = shellIcons[item.icon];
            const label = t(`shell.${item.labelKey}`);
            return (
              <li key={item.id}>
                <NavLink
                  to={item.to}
                  end={item.path === ""}
                  title={collapsed ? label : undefined}
                  aria-label={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `${previewFocus} flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 motion-reduce:transition-none ${
                      collapsed ? "justify-center px-0" : ""
                    } ${isActive ? shellNavActiveClass : shellNavIdleClass}`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className={collapsed ? "sr-only" : undefined}>{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={`mt-auto flex flex-col gap-1 border-t border-soma-line/30 px-3 pt-3 ${
          collapsed ? "items-center" : ""
        }`}
      >
        <LanguageSelector compact={collapsed} floating />
        <AchievementInboxBell compact={collapsed} anchor="right" />
        <AccountMenu compact={collapsed} anchor="right" />
      </div>
    </aside>
  );
}
