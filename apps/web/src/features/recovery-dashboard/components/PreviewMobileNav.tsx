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
      className="z-30 shrink-0 border-t border-soma-line/30 bg-soma-shell-rail/95 backdrop-blur lg:hidden"
      aria-label={t("shell.navAria")}
      data-onb="nav-mobile"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
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
                  `${previewFocus} flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-none px-0.5 py-2.5 text-center text-[10px] leading-tight ${
                    isActive ? shellNavActiveClass : shellNavIdleClass
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="max-w-full px-0.5">{t(`shell.${item.mobileLabelKey}`)}</span>
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
