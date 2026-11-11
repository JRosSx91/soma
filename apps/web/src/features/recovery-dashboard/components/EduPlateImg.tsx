import type { CSSProperties } from "react";
import { eduPlateFor } from "../edu-plate.js";

interface EduPlateImgProps {
  src: string;
  alt?: string;
  className?: string;
  sizes: string;
  fetchPriority?: "high" | "low" | "auto";
  width?: number;
  height?: number;
  decoding?: "async" | "auto" | "sync";
  loading?: "eager" | "lazy";
  draggable?: boolean;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Educational plate: WebP srcset for catalogued process/missions PNGs,
 * PNG fallback otherwise. Layout classes stay on the img.
 */
export function EduPlateImg({
  src,
  alt = "",
  className,
  sizes,
  fetchPriority,
  width,
  height,
  decoding = "async",
  loading = "lazy",
  draggable = false,
  style,
  "aria-hidden": ariaHidden,
}: EduPlateImgProps) {
  const plate = eduPlateFor(src);
  const imgWidth = plate?.width ?? width;
  const imgHeight = plate?.height ?? height;
  const img = (
    <img
      src={src}
      alt={alt}
      width={imgWidth}
      height={imgHeight}
      decoding={decoding}
      draggable={draggable}
      fetchPriority={fetchPriority}
      loading={loading}
      sizes={sizes}
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    />
  );
  if (!plate) return img;
  return (
    <picture className="contents">
      <source type="image/webp" srcSet={plate.webpSrcSet} sizes={sizes} />
      {img}
    </picture>
  );
}
