import type { DemoOrganIcon } from "../demo-data.js";

const illustrations = {
  brain: "/images/anatomy/brain.png",
  lungs: "/images/anatomy/lungs.png",
  heart: "/images/anatomy/heart.png",
  digestive: "/images/anatomy/digestive.png",
  endocrine: "/images/anatomy/thyroid.png",
  immune: "/images/anatomy/spleen.png",
} as const satisfies Record<DemoOrganIcon, string>;

interface AnatomyIllustrationProps {
  name: DemoOrganIcon;
  /** Empty string when the surrounding card already names the organ. */
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}

/**
 * Transparent organ plate. Intrinsic size keeps the slot stable while
 * object-contain preserves the silhouette.
 */
export function AnatomyIllustration({
  name,
  alt,
  className,
  loading = "lazy",
}: AnatomyIllustrationProps) {
  return (
    <img
      src={illustrations[name]}
      alt={alt}
      width={1402}
      height={1122}
      loading={loading}
      decoding="async"
      draggable={false}
      className={`object-contain ${className ?? ""}`}
    />
  );
}
