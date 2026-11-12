import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SomaMark } from "../features/recovery-dashboard/components/SomaMark.js";

/**
 * After this delay the copy explains that the first API connection can be slow.
 * It only changes the message: the session bootstrap keeps waiting.
 */
const APP_BOOT_SLOW_AFTER_MS = 6000;

const DOT_DELAYS = ["0ms", "200ms", "400ms"] as const;

/** Shown while AuthProvider restores the session (POST /auth/refresh). */
export function AppBootScreen() {
  const { t } = useTranslation("common");
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), APP_BOOT_SLOW_AFTER_MS);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#081018] px-6 text-center text-soma-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_50%,rgba(104,216,192,0.16),transparent_34%),radial-gradient(ellipse_at_92%_48%,rgba(134,183,232,0.14),transparent_36%),radial-gradient(ellipse_at_50%_18%,rgba(134,183,232,0.06),transparent_42%)]"
      />
      <div className="relative flex flex-col items-center">
        <span className="inline-flex scale-150">
          <SomaMark />
        </span>
        <span aria-hidden="true" className="mt-8 flex items-center gap-1.5">
          {DOT_DELAYS.map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 rounded-full bg-soma-action/80 motion-safe:animate-pulse"
              style={{ animationDelay: delay }}
            />
          ))}
        </span>
        <div role="status" aria-live="polite" className="mt-5 max-w-sm">
          <p className="text-sm font-medium text-soma-ink">{t("boot.preparing")}</p>
          {slow ? (
            <p className="mt-2 text-xs leading-relaxed text-soma-ink-secondary">
              {t("boot.slowServer")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
