import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../../../components/LanguageSelector.js";
import { AchievementInboxBell } from "../../achievements/components/AchievementInboxBell.js";
import { useShellLayout } from "../hooks/useShellLayout.js";
import { previewFocus } from "../focus.js";
import { AccountMenu } from "./AccountMenu.js";

export function PreviewMobileHeader() {
  const { t } = useTranslation("common");
  const { titleLabel, mobileOpen, setMobileOpen } = useShellLayout();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-soma-line/70 bg-[#081018]/85 px-4 py-3 backdrop-blur-sm lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className={`${previewFocus} flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-soma-ink-secondary hover:bg-soma-surface hover:text-soma-ink lg:hidden`}
          aria-expanded={mobileOpen}
          aria-controls="soma-shell-sidebar"
          aria-label={mobileOpen ? t("shell.closeNav") : t("shell.openNav")}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
        {titleLabel ? (
          <p className="truncate text-sm font-semibold text-soma-ink lg:text-base">
            {titleLabel}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LanguageSelector />
        <AchievementInboxBell compact />
        <AccountMenu compact />
      </div>
    </header>
  );
}
