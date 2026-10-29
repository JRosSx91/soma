import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../auth/index.js";
import { previewFocus } from "../focus.js";
import { placeAnchoredPanel } from "../lib/place-anchored-panel.js";
import { useShellBase } from "../context/ShellBaseContext.js";

interface AccountMenuProps {
  /** Compact circular trigger for the shared shell header. */
  compact?: boolean;
  anchor?: "bottom" | "right";
}

/**
 * Minimal account affordance for the Soma 2.0 shell.
 * Onboarding + logout when signed in; sign-in link when anonymous (preview).
 * Does not expose tokens or private profile fields in public preview.
 */
export function AccountMenu({ compact = false, anchor = "bottom" }: AccountMenuProps) {
  const { t } = useTranslation("account");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const base = useShellBase();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !panelRef.current) return;
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    function place() {
      placeAnchoredPanel(trigger, panel, {
        align: "end",
        anchor,
        minHeight: 120,
        width: 280,
      });
    }
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [anchor, open, user, base]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate("/", { replace: true });
  }

  const triggerClass = compact
    ? `${previewFocus} flex h-9 w-9 items-center justify-center rounded-full text-soma-ink-secondary hover:bg-soma-surface hover:text-soma-ink`
    : `${previewFocus} flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-soma-ink-secondary transition-colors hover:bg-soma-surface hover:text-soma-ink`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClass}
        aria-label={t("menuLabel")}
        title={compact ? t("menuLabel") : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {compact ? (
          <User className="h-5 w-5" aria-hidden="true" />
        ) : (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-soma-surface text-soma-ink">
              <User className="h-4 w-4" aria-hidden="true" />
            </span>
            {t("menuLabel")}
          </>
        )}
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={menuId}
              role="menu"
              className="min-w-[14rem] overflow-y-auto rounded-xl border border-soma-line bg-soma-raised py-1 shadow-lg"
            >
              {user && base === "/app" ? (
                <>
                  <div className="border-b border-soma-line px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted">
                      {t("menuSession")}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-soma-ink">
                      {user.displayName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-soma-ink-muted">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    role="menuitem"
                    to={`${base}/account`}
                    className={`${previewFocus} block px-3 py-2 text-sm text-soma-ink hover:bg-soma-surface`}
                    onClick={() => setOpen(false)}
                  >
                    {t("menuAccount")}
                  </Link>
                  <Link
                    role="menuitem"
                    to={`${base}/feedback`}
                    className={`${previewFocus} block px-3 py-2 text-sm text-soma-ink hover:bg-soma-surface`}
                    onClick={() => setOpen(false)}
                  >
                    {t("menuFeedback")}
                  </Link>
                  <Link
                    role="menuitem"
                    to="/onboarding"
                    className={`${previewFocus} block px-3 py-2 text-sm text-soma-ink hover:bg-soma-surface`}
                    onClick={() => setOpen(false)}
                  >
                    {t("menuSubstances")}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className={`${previewFocus} flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-soma-ink hover:bg-soma-surface`}
                    onClick={handleLogout}
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("menuLogout")}
                  </button>
                </>
              ) : user && base === "/preview" ? (
                <>
                  <p className="border-b border-soma-line px-3 py-2 text-[11px] text-soma-ink-muted">
                    {t("menuPreviewGuest")}
                  </p>
                  <Link
                    role="menuitem"
                    to="/app"
                    className={`${previewFocus} block px-3 py-2 text-sm text-soma-ink hover:bg-soma-surface`}
                    onClick={() => setOpen(false)}
                  >
                    {t("menuOpenApp")}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className={`${previewFocus} flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-soma-ink hover:bg-soma-surface`}
                    onClick={handleLogout}
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("menuLogout")}
                  </button>
                </>
              ) : (
                <>
                  <p className="border-b border-soma-line px-3 py-2 text-[11px] text-soma-ink-muted">
                    {base === "/preview"
                      ? t("menuPreviewGuest")
                      : t("menuAnonymous")}
                  </p>
                  <Link
                    role="menuitem"
                    to="/login"
                    className={`${previewFocus} block px-3 py-2 text-sm text-soma-ink hover:bg-soma-surface`}
                    onClick={() => setOpen(false)}
                  >
                    {t("menuSignIn")}
                  </Link>
                </>
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
