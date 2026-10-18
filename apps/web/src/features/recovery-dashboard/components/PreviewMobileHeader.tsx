import { AccountMenu } from "./AccountMenu.js";
import { SomaMark } from "./SomaMark.js";

export function PreviewMobileHeader() {
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-4 lg:hidden">
      <SomaMark />
      <AccountMenu compact />
    </header>
  );
}
