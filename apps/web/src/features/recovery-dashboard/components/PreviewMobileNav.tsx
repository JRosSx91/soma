import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShellBase } from "../context/ShellBaseContext.js";
import { mobileShellSections } from "../shell-base.js";
import { shellNavActiveClass, shellNavIdleClass } from "../shell-chrome.js";
import { shellIcons } from "../shell-icons.js";
import { previewFocus } from "../focus.js";
import { PreviewMoreMenu } from "./PreviewMoreMenu.js";

export function PreviewMobileNav() {
  const { t } = useTranslation("common");
  const base = useShellBase();
  const sections = mobileShellSections(base);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-soma-line/30 bg-soma-shell-rail/95 backdrop-blur lg:hidden"
      aria-label={t("shell.navAria")}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${sections.length + 1}, minmax(0, 1fr))` }}
      >
        {sections.map((item) => {
          const Icon = shellIcons[item.icon];
          return (
            <li key={item.id}>
              <NavLink
                to={item.to}
                end={item.path === ""}
                className={({ isActive }) =>
                  `${previewFocus} flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-none px-1 py-2.5 text-[10px] ${
                    isActive ? shellNavActiveClass : shellNavIdleClass
                  }`
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {t(`shell.${item.mobileLabelKey}`)}
              </NavLink>
            </li>
          );
        })}
        <li>
          <PreviewMoreMenu />
        </li>
      </ul>
    </nav>
  );
}
