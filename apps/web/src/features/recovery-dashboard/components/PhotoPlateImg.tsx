import type { CSSProperties } from "react";
import { photoPlateFor } from "../photo-plate.js";

interface PhotoPlateImgProps {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  fetchPriority?: "high" | "low" | "auto";
  width?: number;
  height?: number;
  decoding?: "async" | "auto" | "sync";
  loading?: "eager" | "lazy";
  draggable?: boolean;
  style?: CSSProperties;
}

/**
 * Photographic plate: WebP srcset when a catalogued nature PNG is passed,
 * PNG fallback otherwise. Layout classes belong on the img so object-cover
 * still fills the hero frame.
 */
export function PhotoPlateImg({
  src,
  alt = "",
  className,
  sizes = "100vw",
  fetchPriority,
  width,
  height,
  decoding = "async",
  loading,
  draggable = false,
  style,
}: PhotoPlateImgProps) {
  const plate = photoPlateFor(src);
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
