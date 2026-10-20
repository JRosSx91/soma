import { organPlateSrc } from "../anatomy/organ-plate-src.js";
import type { DemoChange, DemoOrganIcon } from "../demo-data.js";

export type OrganCardIllustration =
  | { kind: "plate"; src: string }
  | { kind: "system-icon"; name: DemoOrganIcon }
  | { kind: "placeholder" };

/**
 * Live organ cards use the atlas plate for `change.id`.
 * Demo cards keep the system glyph even when `id` collides with an organ
 * (`lungs` is both a demo milestone and a catalog organ).
 */
export function resolveOrganCardIllustration(
  change: Pick<DemoChange, "id" | "icon">,
  live: boolean,
): OrganCardIllustration {
  if (!live) {
    return change.icon
      ? { kind: "system-icon", name: change.icon }
      : { kind: "placeholder" };
  }
  const src = organPlateSrc(change.id);
  return src ? { kind: "plate", src } : { kind: "placeholder" };
}
