import { LanguageSelector } from "../../../components/LanguageSelector.js";
import { AchievementInboxBell } from "../../achievements/components/AchievementInboxBell.js";
import { AccountMenu } from "./AccountMenu.js";

export function PreviewMobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-end gap-2 border-b border-soma-line/40 bg-[#081018]/95 px-4 py-3 backdrop-blur-sm lg:px-6">
      <LanguageSelector />
      <AchievementInboxBell compact />
      <AccountMenu compact />
    </header>
  );
}
