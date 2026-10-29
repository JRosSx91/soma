import type { ProgressTitleId } from "@soma/shared-types";
import {
  resolveTitleEmblemSize,
  resolveTitleEmblemSrc,
  type TitleEmblemSize,
} from "./title-emblem.js";

export interface TitleEmblemProps {
  titleId: ProgressTitleId;
  size: TitleEmblemSize;
  className?: string;
  /**
   * Accessible name when the emblem is the only title cue
   * (picker option, standalone stamp). Omit when adjacent text
   * already names the title so the image stays decorative.
   */
  label?: string;
}

/**
 * Approved emblem (WebP variant by display size). Home uses it
 * through HomeProgressIdentity; TitlePicker mounts decorative stamps.
 */
export function TitleEmblem({ titleId, size, className, label }: TitleEmblemProps) {
  const src = resolveTitleEmblemSrc(titleId, size);
  const px = resolveTitleEmblemSize(size);
  const decorative = label == null || label.length === 0;
  const classes = [
    "inline-block overflow-visible bg-transparent object-contain object-center",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      src={src}
      width={px}
      height={px}
      alt={decorative ? "" : label}
      aria-hidden={decorative ? true : undefined}
      decoding="async"
      draggable={false}
      className={classes}
      style={{ width: px, height: px, maxWidth: "none" }}
    />
  );
}
