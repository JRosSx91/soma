import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LandingV2Header } from "./LandingV2Header.js";
import { LandingV2Hero } from "./LandingV2Hero.js";
import { LandingV2Journey } from "./LandingV2Journey.js";
import { LandingV2Atlas } from "./LandingV2Atlas.js";
import { LandingV2Science } from "./LandingV2Science.js";
import { LandingV2Methodology } from "./LandingV2Methodology.js";
import { LandingV2Origin } from "./LandingV2Origin.js";
import { LandingV2MissionsJournal } from "./LandingV2MissionsJournal.js";
import { LandingV2Achievements } from "./LandingV2Achievements.js";
import { LandingV2Closing } from "./LandingV2Closing.js";
import { LandingV2IntroProvider, SomaIntro } from "./SomaIntro.js";
import { shouldPlayLandingV2Intro } from "./soma-intro-session.js";
import { useAuth } from "../auth/index.js";
import { SkipToContent } from "../../components/SkipToContent.js";

/**
 * Public Soma 2.0 landing. Mounted at `/` for anonymous visitors.
 */
export function LandingV2Page() {
  const { t } = useTranslation(["landing-v2", "account"]);
  const { sessionNotice } = useAuth();
  const accountDeleted = sessionNotice === "account_deleted";
  const [showIntro] = useState(
    () => !accountDeleted && shouldPlayLandingV2Intro(),
  );
  const [introVisible, setIntroVisible] = useState(showIntro);
  const [introComplete, setIntroComplete] = useState(!showIntro);
  const playedIntro = useRef(showIntro);

  useEffect(() => {
    const previous = document.title;
    document.title = t("metaTitle");
    return () => {
      document.title = previous;
    };
  }, [t]);

  useEffect(() => {
    if (playedIntro.current && !introVisible) {
      document.getElementById("landing-v2-main")?.focus({ preventScroll: true });
    }
  }, [introVisible]);

  return (
    <LandingV2IntroProvider introComplete={introComplete}>
      <div
        className="min-h-svh overflow-x-hidden bg-[#081018] text-soma-ink [--landing-v2-header:3.75rem]"
        aria-hidden={introVisible}
        inert={introVisible}
      >
        <SkipToContent targetId="landing-v2-main" />
        <LandingV2Header />
        <main id="landing-v2-main" tabIndex={-1}>
          {accountDeleted ? (
            <p
              className="mx-auto max-w-6xl px-4 pt-6 text-sm text-soma-ink sm:px-6"
              role="status"
            >
              {t("delete.success", { ns: "account" })}
            </p>
          ) : null}
          <LandingV2Hero />
          <LandingV2Journey />
          <LandingV2Atlas />
          <LandingV2Science />
          <LandingV2Methodology />
          <LandingV2Origin />
          <LandingV2MissionsJournal />
          <LandingV2Achievements />
          <LandingV2Closing />
        </main>
      </div>
      {introVisible ? (
        <SomaIntro
          onReveal={() => setIntroComplete(true)}
          onComplete={() => setIntroVisible(false)}
        />
      ) : null}
    </LandingV2IntroProvider>
  );
}
