import { User } from "lucide-react";
import { previewFocus } from "../focus.js";
import { SomaMark } from "./SomaMark.js";

export function PreviewMobileHeader() {
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-4 lg:hidden">
      <SomaMark />
      <button
        type="button"
        className={`${previewFocus} flex h-9 w-9 items-center justify-center rounded-full text-soma-ink-secondary hover:bg-soma-surface hover:text-soma-ink`}
        aria-label="Cuenta"
        title="Disponible en una fase posterior"
      >
        <User className="h-5 w-5" aria-hidden="true" />
      </button>
    </header>
  );
}
