import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Ellipsis } from "lucide-react";
import { previewFocus } from "../focus.js";
import { placeAnchoredPanel } from "../lib/place-anchored-panel.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import {
  isSectionPathActive,
  moreShellSections,
  railMoreShellSections,
} from "../shell-base.js";
import { shellNavActiveClass, shellNavIdleClass } from "../shell-chrome.js";
import { shellIcons } from "../shell-icons.js";

interface PreviewMoreMenuProps {
  /** `dock` is the mobile bar; `rail` sits in the desktop sidebar. */
  variant?: "dock" | "rail";
  collapsed?: boolean;
}

export function PreviewMoreMenu({
  variant = "dock",
  collapsed = false,
}: PreviewMoreMenuProps) {
  const { t } = useTranslation("common");
  const base = useShellBase();
  const { pathname } = useLocation();
  const items =
    variant === "rail" ? railMoreShellSections(base) : moreShellSections(base);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const childActive = items.some((item) =>
    isSectionPathActive(item.to, pathname, { end: item.path === "" }),
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !panelRef.current) return;
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    function place() {
      placeAnchoredPanel(trigger, panel, {
        align: variant === "rail" ? "start" : "end",
        anchor: variant === "rail" ? "right" : "bottom",
        minHeight: 120,
        width: 240,
      });
    }
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, variant]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const nodes = [
        ...(panelRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? []),
      ];
      if (nodes.length === 0) return;
      event.preventDefault();
      const current = nodes.findIndex((node) => node === document.activeElement);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next = nodes[(current + delta + nodes.length) % nodes.length];
      next?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const first = panelRef.current.querySelector<HTMLElement>("[role='menuitem']");
    first?.focus();
  }, [open]);

  if (items.length === 0) return null;

  const triggerClass =
    variant === "rail"
      ? `${previewFocus} flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
          collapsed ? "justify-center px-0" : ""
        } ${open || childActive ? shellNavActiveClass : shellNavIdleClass}`
      : `${previewFocus} flex min-h-12 w-full flex-col items-center justify-center gap-1 px-1 py-2.5 text-[10px] ${
          open || childActive ? shellNavActiveClass : shellNavIdleClass
        }`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClass}
        aria-label={t("shell.more")}
        title={variant === "rail" && collapsed ? t("shell.more") : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Ellipsis
          className={variant === "rail" ? "h-4 w-4 shrink-0" : "h-5 w-5"}
          aria-hidden="true"
        />
        <span className={variant === "rail" && collapsed ? "sr-only" : undefined}>
          {t("shell.more")}
        </span>
      </button>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={menuId}
              role="menu"
              aria-label={t("shell.moreMenuAria")}
              className="min-w-[12rem] overflow-y-auto rounded-xl border border-soma-line/50 bg-soma-shell-rail py-1"
            >
              {items.map((item) => {
                const Icon = shellIcons[item.icon];
                return (
                  <NavLink
                    key={item.id}
                    role="menuitem"
                    to={item.to}
                    end={item.path === ""}
                    className={({ isActive }) =>
                      `${previewFocus} mx-1 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                        isActive ? shellNavActiveClass : shellNavIdleClass
                      }`
                    }
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {t(`shell.${item.labelKey}`)}
                  </NavLink>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
