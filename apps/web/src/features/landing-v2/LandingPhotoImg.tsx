import type { CSSProperties, SyntheticEvent } from "react";
import { landingPhotoFor } from "./landing-photo.js";

interface LandingPhotoImgProps {
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
  "aria-hidden"?: boolean | "true" | "false";
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Landing photographic / art plate: WebP srcset when catalogued, PNG fallback.
 * Layout classes stay on the img so object-cover / contain behave as before.
 */
export function LandingPhotoImg({
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
  "aria-hidden": ariaHidden,
  onLoad,
}: LandingPhotoImgProps) {
  const plate = landingPhotoFor(src);
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
      onLoad={onLoad}
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
