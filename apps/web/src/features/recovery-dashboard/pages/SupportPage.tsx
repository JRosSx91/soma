import { useTranslation } from "react-i18next";
import { useShellBase } from "../context/ShellBaseContext.js";
import { RecoveryHero } from "../components/RecoveryHero.js";
import { SupportSections } from "../support/SupportSections.js";

const SUPPORT_HERO_IMAGE = "/images/decoration/nature-11.png";
/** Keeps the sun and the misty ridges in frame when narrow screens crop the sides. */
const SUPPORT_HERO_OBJECT_POSITION = "62% 55%";
const SUPPORT_HERO_OVERLAY =
  "linear-gradient(180deg, rgb(var(--soma-shell-rail) / 0.5) 0%, rgb(var(--soma-shell-rail) / 0.18) 45%, transparent 72%), linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.82) 0%, rgb(var(--soma-shell-rail) / 0.4) 38%, rgb(var(--soma-shell-rail) / 0.08) 64%, transparent 86%)";

export function SupportPage() {
  const { t } = useTranslation("support");
  const base = useShellBase();
  const demo = base === "/preview";

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-8">
      <RecoveryHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("intro")}
        quote={t("quote")}
        demo={demo}
        imageSrc={SUPPORT_HERO_IMAGE}
        objectPosition={SUPPORT_HERO_OBJECT_POSITION}
        overlay={SUPPORT_HERO_OVERLAY}
        fetchPriority="high"
      />
      <SupportSections />
    </div>
  );
}
