import { MedalMark, type MedalTier } from "./MedalMark.js";

const tierLabel: Record<MedalTier, string> = {
  bronze: "Bronce",
  silver: "Plata",
  gold: "Oro",
  platinum: "Platino",
};

/**
 * Only combinations that exist as files. Alcohol and caffeine are absent.
 * A missing pair falls back to MedalMark; nothing is borrowed from another
 * substance or tier.
 */
const medalArt = {
  "cannabis:bronze": { src: "/images/achievements/cannabis-bronze.png", width: 1269, height: 1240 },
  "cannabis:silver": { src: "/images/achievements/cannabis-silver.png", width: 1274, height: 1234 },
  "cannabis:gold": { src: "/images/achievements/cannabis-gold.png", width: 1286, height: 1223 },
  "cannabis:platinum": { src: "/images/achievements/cannabis-platinum.png", width: 1278, height: 1230 },
  "nicotine:bronze": { src: "/images/achievements/nicotine-bronze.png", width: 1278, height: 1230 },
  "nicotine:silver": { src: "/images/achievements/nicotine-silver.png", width: 1275, height: 1234 },
  "nicotine:gold": { src: "/images/achievements/nicotine-gold.png", width: 1286, height: 1223 },
  "nicotine:platinum": { src: "/images/achievements/nicotine-platinum.png", width: 1278, height: 1230 },
  "cocaine:bronze": { src: "/images/achievements/cocaine-bronze.png", width: 1272, height: 1236 },
  "cocaine:silver": { src: "/images/achievements/cocaine-silver.png", width: 1254, height: 1254 },
  "cocaine:gold": { src: "/images/achievements/cocaine-gold.png", width: 1286, height: 1223 },
  "cocaine:platinum": { src: "/images/achievements/cocaine-platinum.png", width: 1272, height: 1236 },
} as const;

type MedalKey = keyof typeof medalArt;

interface AchievementMedalProps {
  substanceId: string;
  tier: MedalTier;
  /** Hidden achievement. Shows the lock and never the illustration. */
  sealed?: boolean;
  /**
   * Locked medals stay recognizable but quieter than an unlocked one.
   */
  locked?: boolean;
  size?: "card" | "detail";
}

export function AchievementMedal({
  substanceId,
  tier,
  sealed = false,
  locked = true,
  size = "card",
}: AchievementMedalProps) {
  if (sealed) {
    return <MedalMark tier={tier} substanceId={substanceId} sealed size={size} />;
  }

  const art = medalArt[`${substanceId}:${tier}` as MedalKey];
  if (!art) {
    return <MedalMark tier={tier} substanceId={substanceId} size={size} />;
  }

  const frame = size === "detail" ? "h-52 sm:h-60" : "h-36 sm:h-40";
  const tone = locked ? "brightness-[0.86] saturate-[0.82]" : "";

  return (
    <span className="flex w-full flex-col items-center gap-1">
      <img
        src={art.src}
        width={art.width}
        height={art.height}
        alt=""
        decoding="async"
        draggable={false}
        className={`${frame} w-full object-contain ${tone}`}
      />
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-soma-ink">
        {tierLabel[tier]}
      </span>
    </span>
  );
}
