import { LanguageSelector } from "../../../components/LanguageSelector.js";
import { AchievementInboxBell } from "../../achievements/components/AchievementInboxBell.js";
import { AccountMenu } from "./AccountMenu.js";
import { SomaMark } from "./SomaMark.js";

export function PreviewMobileHeader() {
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-4 lg:hidden">
      <SomaMark />
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <AchievementInboxBell compact />
        <AccountMenu compact />
      </div>
    </header>
  );
}
