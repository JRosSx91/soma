import { LanguageSelector } from "../../../components/LanguageSelector.js";
import { AchievementInboxBell } from "../../achievements/components/AchievementInboxBell.js";
import { AccountMenu } from "./AccountMenu.js";
import { SomaMark } from "./SomaMark.js";

export function PreviewMobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-soma-line/30 bg-soma-shell-rail/95 px-4 py-3 backdrop-blur-sm lg:hidden">
      <SomaMark />
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <AchievementInboxBell compact />
        <AccountMenu compact />
      </div>
    </header>
  );
}
