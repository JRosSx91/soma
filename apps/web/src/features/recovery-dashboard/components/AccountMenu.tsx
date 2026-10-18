import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../auth/index.js";
import { previewFocus } from "../focus.js";
import { useShellBase } from "../context/ShellBaseContext.js";

interface AccountMenuProps {
  /** Compact circular trigger for the mobile header. */
  compact?: boolean;
}

/**
 * Minimal account affordance for the Soma 2.0 shell.
 * Onboarding + logout when signed in; sign-in link when anonymous (preview).
 */
export function AccountMenu({ compact = false }: AccountMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const base = useShellBase();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  const triggerClass = compact
    ? `${previewFocus} flex h-9 w-9 items-center justify-center rounded-full text-soma-ink-secondary hover:bg-soma-surface hover:text-soma-ink`
    : `${previewFocus} flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-soma-ink-secondary transition-colors hover:bg-soma-surface hover:text-soma-ink`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={triggerClass}
        aria-label="Cuenta"
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
            Cuenta
          </>
        )}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={`absolute z-50 min-w-[12rem] rounded-xl border border-soma-line bg-soma-raised py-1 shadow-lg ${
            compact ? "right-0 top-full mt-2" : "left-0 bottom-full mb-2 w-full"
          }`}
        >
          {user ? (
            <>
              <p className="truncate px-3 py-2 text-[11px] text-soma-ink-muted">
                {user.email}
              </p>
              <Link
                role="menuitem"
                to="/onboarding"
                className={`${previewFocus} block px-3 py-2 text-sm text-soma-ink hover:bg-soma-surface`}
                onClick={() => setOpen(false)}
              >
                Onboarding
              </Link>
              {base === "/app" ? (
                <Link
                  role="menuitem"
                  to="/app-legacy"
                  className={`${previewFocus} block px-3 py-2 text-sm text-soma-ink hover:bg-soma-surface`}
                  onClick={() => setOpen(false)}
                >
                  Versión anterior
                </Link>
              ) : null}
              <button
                type="button"
                role="menuitem"
                className={`${previewFocus} flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-soma-ink hover:bg-soma-surface`}
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              role="menuitem"
              to="/login"
              className={`${previewFocus} block px-3 py-2 text-sm text-soma-ink hover:bg-soma-surface`}
              onClick={() => setOpen(false)}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
