import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";
import { useShellBase } from "../context/ShellBaseContext.js";
import { RecoveryHero } from "../components/RecoveryHero.js";
import { SupportSections } from "../support/SupportSections.js";
import { SupportStrategySheet } from "../support/SupportStrategySheet.js";
import {
  SUPPORT_GUIDE_ANCHOR_ID,
  SUPPORT_HELP_PANEL_HASH,
  SUPPORT_STRATEGIES_PANEL_HASH,
} from "../support/support-guide.js";
import {
  SUPPORT_BREATHING_ANCHOR_ID,
  SUPPORT_STRATEGY_QUERY_KEY,
  resolveSupportStrategyQueryParam,
  writeSupportStrategySearchParams,
} from "../support/support-strategies.js";

const SUPPORT_HERO_IMAGE = "/images/decoration/nature-11.png";
/** Keeps the sun and the misty ridges in frame when narrow screens crop the sides. */
const SUPPORT_HERO_OBJECT_POSITION = "62% 55%";
const SUPPORT_HERO_OVERLAY =
  "linear-gradient(180deg, rgb(var(--soma-shell-rail) / 0.5) 0%, rgb(var(--soma-shell-rail) / 0.18) 45%, transparent 72%), linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.82) 0%, rgb(var(--soma-shell-rail) / 0.4) 38%, rgb(var(--soma-shell-rail) / 0.08) 64%, transparent 86%)";

/** In-page anchors the hub may scroll to (SPA hash changes do not scroll by themselves). */
const SUPPORT_HASH_SCROLL_IDS = new Set<string>([
  SUPPORT_BREATHING_ANCHOR_ID,
  SUPPORT_STRATEGIES_PANEL_HASH,
  SUPPORT_HELP_PANEL_HASH,
  SUPPORT_GUIDE_ANCHOR_ID,
  "support-plan-title",
]);

export function SupportPage() {
  const { t } = useTranslation("support");
  const base = useShellBase();
  const demo = base === "/preview";
  const { hash } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const strategyParam = searchParams.get(SUPPORT_STRATEGY_QUERY_KEY);
  const strategyId = resolveSupportStrategyQueryParam(strategyParam);

  // Unknown or blocked IDs never open content; strip the param without stacking history.
  useEffect(() => {
    if (!strategyParam || strategyId) return;
    setSearchParams((current) => writeSupportStrategySearchParams(current, null), {
      replace: true,
    });
  }, [strategyParam, strategyId, setSearchParams]);

  // Deep-links from strategies / the support guide: scroll allow-listed hashes; focus breathing only.
  useEffect(() => {
    if (strategyId) return;
    if (!hash.startsWith("#") || hash.length < 2) return;
    let id = hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      return;
    }
    if (!SUPPORT_HASH_SCROLL_IDS.has(id)) return;
    const target = document.getElementById(id);
    if (!(target instanceof HTMLElement)) return;
    target.scrollIntoView({ block: "start" });
    if (id === SUPPORT_BREATHING_ANCHOR_ID) {
      target.focus({ preventScroll: true });
    }
  }, [hash, strategyId]);

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
      {strategyId ? <SupportStrategySheet strategyId={strategyId} /> : <SupportSections />}
    </div>
  );
}
