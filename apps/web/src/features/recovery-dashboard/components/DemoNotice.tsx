import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../focus.js";

/**
 * Compact stand-in for the old full-width demo row.
 * The sentence is in the accessible name and in a panel opened by click,
 * Enter, Space, or a tap. Hover alone does not reveal it.
 */
export function DemoNotice() {
  const { t } = useTranslation("recovery");
  const disclaimer = t("demoDisclaimer");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className={`${previewFocus} rounded-full border border-soma-action/40 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-soma-action`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`DEMO. ${disclaimer}`}
        onClick={() => setOpen((value) => !value)}
      >
        DEMO
      </button>
      <p
        id={panelId}
        role="note"
        hidden={!open}
        className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border border-soma-line bg-soma-surface px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-soma-ink shadow-[0_12px_32px_rgb(4_10_16/0.45)]"
      >
        {disclaimer}
      </p>
    </span>
  );
}
