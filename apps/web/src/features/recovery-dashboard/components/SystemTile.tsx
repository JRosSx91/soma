import type { DemoSystem } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import { OrganGlyph } from "./OrganGlyph.js";

interface SystemTileProps {
  system: DemoSystem;
}

export function SystemTile({ system }: SystemTileProps) {
  return (
    <button
      type="button"
      className={`${previewFocus} flex w-28 shrink-0 flex-col items-start rounded-2xl border border-soma-line bg-soma-surface/90 p-3 text-left transition-colors hover:border-soma-line-strong hover:bg-soma-raised/50 sm:w-36 sm:p-4 lg:w-full lg:p-2.5 xl:p-2`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-soma-canvas text-soma-physiology lg:h-8 lg:w-8 xl:h-7 xl:w-7">
        <OrganGlyph icon={system.icon} className="h-5 w-5 lg:h-4 lg:w-4" />
      </span>
      <span className="mt-3 text-xs leading-tight text-soma-ink-secondary sm:text-sm lg:mt-2 xl:mt-1.5">
        {system.name}
      </span>
      <span className="mt-1 text-sm font-semibold tabular-nums text-soma-ink">
        <span className="sr-only">Estimación de demostración </span>
        {system.endLabel}
      </span>
    </button>
  );
}
