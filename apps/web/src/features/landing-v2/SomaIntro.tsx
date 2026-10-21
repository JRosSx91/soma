import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { markLandingV2IntroSeen } from "./soma-intro-session.js";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const MARK_PATH =
  "M1 9.5 C4 9.5 4.5 9.5 6 9.5 C8 9.5 8.2 3 10.2 3 C12.2 3 12.4 13 14.6 13 C16.6 13 16.8 7 18.4 7 C20 7 20.4 9.5 22 9.5 H27";

const DRAW_S = 1.0;
const SHIFT_DELAY_S = 1.0;
const SHIFT_S = 0.6;
const WORD_DELAY_S = 1.4;
const LETTER_STAGGER_S = 0.09;
const LETTER_FADE_S = 0.5;
const LETTERS = ["s", "o", "m", "a"] as const;
const FADE_S = 0.8;
const SKIP_FADE_S = 0.22;
const FADE_AT_MS = 3000;

type IntroContextValue = {
  /** True after the overlay finishes, is skipped, or is not shown. Gate Hero entrance on this. */
  introComplete: boolean;
};

const LandingV2IntroContext = createContext<IntroContextValue>({
  introComplete: true,
});

export function LandingV2IntroProvider({
  introComplete,
  children,
}: {
  introComplete: boolean;
  children: ReactNode;
}) {
  return (
    <LandingV2IntroContext.Provider value={{ introComplete }}>
      {children}
    </LandingV2IntroContext.Provider>
  );
}

export function useLandingV2Intro(): IntroContextValue {
  return useContext(LandingV2IntroContext);
}

type SomaIntroProps = {
  onReveal: () => void;
  onComplete: () => void;
};

export function SomaIntro({ onReveal, onComplete }: SomaIntroProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const overlayRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const revealedRef = useRef(false);
  const finishedRef = useRef(false);
  const [fading, setFading] = useState(false);
  const [skipping, setSkipping] = useState(false);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  function revealOnce() {
    if (revealedRef.current) return;
    revealedRef.current = true;
    onReveal();
  }

  function finishOnce() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete();
  }

  function beginFade(fromSkip: boolean) {
    if (closingRef.current) return;
    closingRef.current = true;
    markLandingV2IntroSeen();
    setSkipping(fromSkip);
    setFading(true);
    revealOnce();
  }

  useEffect(() => {
    const fadeAt = window.setTimeout(() => beginFade(false), FADE_AT_MS);
    return () => window.clearTimeout(fadeAt);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        beginFade(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const overlay = (
    <motion.div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="soma"
      contentEditable={false}
      spellCheck={false}
      className="fixed inset-0 z-[80] flex cursor-default items-center justify-center overflow-hidden bg-[#081018] caret-transparent outline-none select-none [-webkit-tap-highlight-color:transparent]"
      style={{
        overscrollBehavior: "none",
        touchAction: "none",
        caretColor: "transparent",
        outline: "none",
        userSelect: "none",
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: skipping ? SKIP_FADE_S : FADE_S, ease }}
      onAnimationComplete={() => {
        if (!closingRef.current || !overlayRef.current) return;
        if (Number(getComputedStyle(overlayRef.current).opacity) < 0.05) {
          finishOnce();
        }
      }}
      onPointerDown={() => beginFade(true)}
      onWheel={(event) => event.preventDefault()}
    >
      <motion.div
        className="flex items-center gap-3"
        initial={reduceMotion ? false : { x: 44 }}
        animate={{ x: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { delay: SHIFT_DELAY_S, duration: SHIFT_S, ease }
        }
      >
        <svg
          viewBox="0 0 28 16"
          aria-hidden="true"
          className="h-10 w-[4.375rem] shrink-0"
          fill="none"
        >
          <motion.path
            d={MARK_PATH}
            stroke="#68D8C0"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: DRAW_S, ease }}
          />
        </svg>
        <span
          aria-hidden="true"
          className="inline-flex caret-transparent select-none text-[2rem] font-semibold leading-none tracking-tight text-white"
        >
          {LETTERS.map((letter, index) => (
            <motion.span
              key={letter}
              className="inline-block"
              initial={reduceMotion ? false : { opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      delay: WORD_DELAY_S + index * LETTER_STAGGER_S,
                      duration: LETTER_FADE_S,
                      ease,
                    }
              }
            >
              {letter}
            </motion.span>
          ))}
        </span>
      </motion.div>
    </motion.div>
  );

  return createPortal(overlay, document.body);
}
