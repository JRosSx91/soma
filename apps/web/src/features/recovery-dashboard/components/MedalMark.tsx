import { useId } from "react";
import { Lock } from "lucide-react";
import { medalFrameClass, type MedalDisplaySize } from "./medal-frame.js";
import { SubstanceIllustration } from "./SubstanceIllustration.js";

export type MedalTier = "bronze" | "silver" | "gold" | "platinum";

const tierLabel: Record<MedalTier, string> = {
  bronze: "Bronce",
  silver: "Plata",
  gold: "Oro",
  platinum: "Platino",
};

interface MedalMarkProps {
  tier: MedalTier;
  substanceId: string;
  /** Hides the substance plate. The tier silhouette and its name stay visible. */
  sealed?: boolean;
  size?: MedalDisplaySize;
  /** Defaults to the Spanish tier caption used on the achievements pages. */
  showTierLabel?: boolean;
}

/**
 * Four medal materials. Silhouette, engraving and the tier name distinguish
 * them; color is only one of those cues.
 */
export function MedalMark({
  tier,
  substanceId,
  sealed = false,
  size = "card",
  showTierLabel = true,
}: MedalMarkProps) {
  const uid = useId().replace(/:/g, "");
  const { frame, compactLike: compact } = medalFrameClass(size);
  return (
    <span className={compact ? "inline-flex flex-col items-center" : "flex w-full flex-col items-center gap-1"}>
      <span className={`relative flex items-center justify-center ${compact ? frame : `w-full ${frame}`}`}>
        <span className="relative aspect-square h-full">
          <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
            <MedalShape tier={tier} uid={uid} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-[52%] w-[52%] items-center justify-center overflow-hidden rounded-full bg-[#081018] ring-1 ring-black/50">
              {sealed ? (
                <Lock className="h-[42%] w-[42%] text-soma-ink-secondary" aria-hidden="true" />
              ) : (
                <SubstanceIllustration name={substanceId} className="h-[86%] w-[86%]" alt="" />
              )}
            </span>
          </span>
        </span>
      </span>
      {showTierLabel ? (
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-soma-ink">
          {tierLabel[tier]}
        </span>
      ) : null}
    </span>
  );
}

function MedalShape({ tier, uid }: { tier: MedalTier; uid: string }) {
  if (tier === "silver") return <SilverMedal uid={uid} />;
  if (tier === "gold") return <GoldMedal uid={uid} />;
  if (tier === "platinum") return <PlatinumMedal uid={uid} />;
  return <BronzeMedal uid={uid} />;
}

function BronzeMedal({ uid }: { uid: string }) {
  const fill = `${uid}-bronze`;
  const grain = `${uid}-grain`;
  return (
    <>
      <defs>
        <radialGradient id={fill} cx="32%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#F3D2B0" />
          <stop offset="42%" stopColor="#C4844A" />
          <stop offset="100%" stopColor="#5C3018" />
        </radialGradient>
        <pattern id={grain} width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="#3A2012" opacity="0.45" />
        </pattern>
      </defs>
      <circle cx="40" cy="40" r="36" fill={`url(#${fill})`} stroke="#F0D2B4" strokeWidth="2" />
      <circle cx="40" cy="40" r="30" fill={`url(#${grain})`} />
      <circle
        cx="40"
        cy="40"
        r="27"
        fill="none"
        stroke="#4A2814"
        strokeWidth="1.6"
        strokeDasharray="1.5 3.5"
      />
    </>
  );
}

function SilverMedal({ uid }: { uid: string }) {
  const fill = `${uid}-silver`;
  const brush = `${uid}-brush`;
  const hex = "40,8 69,24 69,56 40,72 11,56 11,24";
  return (
    <>
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F7F8F8" />
          <stop offset="38%" stopColor="#C5CCD1" />
          <stop offset="100%" stopColor="#6E787F" />
        </linearGradient>
        <pattern id={brush} width="8" height="3" patternUnits="userSpaceOnUse">
          <line x1="0" y1="1.5" x2="8" y2="1.5" stroke="#4E585F" strokeWidth="0.6" opacity="0.45" />
        </pattern>
      </defs>
      <polygon points={hex} fill={`url(#${fill})`} stroke="#F4F6F7" strokeWidth="2" />
      <polygon points="40,16 61,28 61,52 40,64 19,52 19,28" fill={`url(#${brush})`} />
      <polygon points="40,16 61,28 61,52 40,64 19,52 19,28" fill="none" stroke="#5C6770" strokeWidth="1.6" />
      <polygon points="40,22 55,31 55,49 40,58 25,49 25,31" fill="none" stroke="#EEF1F2" strokeWidth="1" />
    </>
  );
}

function GoldMedal({ uid }: { uid: string }) {
  const fill = `${uid}-gold`;
  const rays = Array.from({ length: 24 }, (_, index) => {
    const radius = index % 2 === 0 ? 37 : 29;
    const angle = (index / 24) * Math.PI * 2 - Math.PI / 2;
    const x = 40 + Math.cos(angle) * radius;
    const y = 40 + Math.sin(angle) * radius;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return (
    <>
      <defs>
        <radialGradient id={fill} cx="34%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFF4C8" />
          <stop offset="40%" stopColor="#E2B34A" />
          <stop offset="100%" stopColor="#8A5E10" />
        </radialGradient>
      </defs>
      <polygon points={rays.join(" ")} fill="#A8741A" opacity="0.95" />
      <circle cx="40" cy="40" r="28" fill={`url(#${fill})`} stroke="#FFF1C2" strokeWidth="2.4" />
      <circle cx="40" cy="40" r="23" fill="none" stroke="#7A5410" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="19" fill="none" stroke="#FFE7A0" strokeWidth="1" />
    </>
  );
}

function PlatinumMedal({ uid }: { uid: string }) {
  const fill = `${uid}-platinum`;
  const diamond = "40,4 74,40 40,76 6,40";
  return (
    <>
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4FBFF" />
          <stop offset="45%" stopColor="#C9D7E4" />
          <stop offset="100%" stopColor="#6E8494" />
        </linearGradient>
      </defs>
      <polygon points={diamond} fill={`url(#${fill})`} stroke="#E7F6FF" strokeWidth="2" />
      <polygon points="40,18 62,40 40,62 18,40" fill="none" stroke="#31586A" strokeWidth="1.5" />
      <line x1="40" y1="18" x2="40" y2="62" stroke="#F7FCFF" strokeWidth="0.8" />
      <line x1="18" y1="40" x2="62" y2="40" stroke="#F7FCFF" strokeWidth="0.8" />
    </>
  );
}
