import { Cigarette, Leaf, Mountain, type LucideIcon } from "lucide-react";

/**
 * Real RGBA plates. Scale compensates for each silhouette inside the same
 * circle: the leaf already fills the frame, the cigarette sits in a wide
 * plate, and the cocaine mound is short and wide.
 * Caffeine and alcohol are mapped for later views and are not mounted by the
 * current DEMO cards.
 */
const illustrations = {
  cannabis: {
    src: "/images/substances/cannabis.png",
    width: 1313,
    height: 1198,
    scale: "scale-95",
  },
  nicotine: {
    src: "/images/substances/nicotine.png",
    width: 1536,
    height: 1024,
    scale: "scale-110",
  },
  cocaine: {
    src: "/images/substances/cocaine.png",
    width: 1536,
    height: 1024,
    scale: "scale-100",
  },
  caffeine: {
    src: "/images/substances/caffeine.png",
    width: 1536,
    height: 1024,
    scale: "scale-105",
  },
  alcohol: {
    src: "/images/substances/alcohol.png",
    width: 1536,
    height: 1024,
    scale: "scale-125",
  },
} as const;

const fallbackIcons: Record<string, LucideIcon> = {
  cannabis: Leaf,
  nicotine: Cigarette,
  cocaine: Mountain,
};

interface SubstanceIllustrationProps {
  name: string;
  /** Stable frame. Defaults to filling the parent circle. */
  className?: string;
  /** Size of the provisional icon when no usable plate exists. */
  iconClassName?: string;
  alt?: string;
}

export function SubstanceIllustration({
  name,
  className = "h-full w-full",
  iconClassName = "h-3.5 w-3.5",
  alt = "",
}: SubstanceIllustrationProps) {
  const art = illustrations[name as keyof typeof illustrations];

  if (!art) {
    const Icon = fallbackIcons[name] ?? Leaf;
    return <Icon className={iconClassName} aria-hidden="true" />;
  }

  return (
    <img
      src={art.src}
      alt={alt}
      width={art.width}
      height={art.height}
      decoding="async"
      draggable={false}
      className={`object-contain ${art.scale} ${className}`}
    />
  );
}
