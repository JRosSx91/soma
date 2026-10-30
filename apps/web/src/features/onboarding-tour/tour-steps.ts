import type { SomiState } from "../somi/somi-model.js";

export const ONB_TOUR_LG_QUERY = "(min-width: 1024px)";

export const ONB_TOUR_STEP_IDS = [
  "home",
  "nav",
  "recovery",
  "explore",
  "anatomy",
  "missions",
  "journal",
  "achievements",
  "account",
] as const;

export type OnbTourStepId = (typeof ONB_TOUR_STEP_IDS)[number];

export type OnbTourAnchorId =
  | "home-title"
  | "nav-desktop"
  | "nav-mobile"
  | "recovery-title"
  | "explore-title"
  | "anatomy-title"
  | "missions-title"
  | "journal-title"
  | "achievements-title"
  | "account-title";

export interface OnbTourAnchors {
  default: OnbTourAnchorId;
  desktop?: OnbTourAnchorId;
  mobile?: OnbTourAnchorId;
}

export interface OnbTourStep {
  id: OnbTourStepId;
  /** Path under the active shell base (`""` is Inicio). */
  path: "" | `/${string}`;
  anchors: OnbTourAnchors;
  somi: SomiState;
  titleKey: `steps.${OnbTourStepId}.title`;
  bodyKey: `steps.${OnbTourStepId}.body`;
}

export const ONB_TOUR_STEPS: readonly OnbTourStep[] = [
  {
    id: "home",
    path: "",
    anchors: { default: "home-title" },
    somi: "waving",
    titleKey: "steps.home.title",
    bodyKey: "steps.home.body",
  },
  {
    id: "nav",
    path: "",
    anchors: {
      default: "nav-desktop",
      desktop: "nav-desktop",
      mobile: "nav-mobile",
    },
    somi: "idle",
    titleKey: "steps.nav.title",
    bodyKey: "steps.nav.body",
  },
  {
    id: "recovery",
    path: "/recovery",
    anchors: { default: "recovery-title" },
    somi: "thinking",
    titleKey: "steps.recovery.title",
    bodyKey: "steps.recovery.body",
  },
  {
    id: "explore",
    path: "/explore",
    anchors: { default: "explore-title" },
    somi: "thinking",
    titleKey: "steps.explore.title",
    bodyKey: "steps.explore.body",
  },
  {
    id: "anatomy",
    path: "/anatomy",
    anchors: { default: "anatomy-title" },
    somi: "idle",
    titleKey: "steps.anatomy.title",
    bodyKey: "steps.anatomy.body",
  },
  {
    id: "missions",
    path: "/missions",
    anchors: { default: "missions-title" },
    somi: "celebrating",
    titleKey: "steps.missions.title",
    bodyKey: "steps.missions.body",
  },
  {
    id: "journal",
    path: "/journal",
    anchors: { default: "journal-title" },
    somi: "supportive",
    titleKey: "steps.journal.title",
    bodyKey: "steps.journal.body",
  },
  {
    id: "achievements",
    path: "/achievements",
    anchors: { default: "achievements-title" },
    somi: "celebrating",
    titleKey: "steps.achievements.title",
    bodyKey: "steps.achievements.body",
  },
  {
    id: "account",
    path: "/account",
    anchors: { default: "account-title" },
    somi: "idle",
    titleKey: "steps.account.title",
    bodyKey: "steps.account.body",
  },
];

export function isOnbTourStepId(value: unknown): value is OnbTourStepId {
  return typeof value === "string" && (ONB_TOUR_STEP_IDS as readonly string[]).includes(value);
}

export function stepIndexById(id: OnbTourStepId): number {
  return ONB_TOUR_STEP_IDS.indexOf(id);
}

export function tourHref(base: "/app" | "/preview", step: OnbTourStep): string {
  return `${base}${step.path}`;
}

export function isTourPath(pathname: string, base: "/app" | "/preview", step: OnbTourStep): boolean {
  const href = tourHref(base, step);
  if (step.path === "") {
    return pathname === href || pathname === `${href}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function resolveAnchorId(
  step: OnbTourStep,
  desktop: boolean,
): OnbTourAnchorId {
  if (desktop && step.anchors.desktop) return step.anchors.desktop;
  if (!desktop && step.anchors.mobile) return step.anchors.mobile;
  return step.anchors.default;
}

export function queryTourAnchor(anchorId: OnbTourAnchorId): Element | null {
  if (typeof document === "undefined") return null;
  return document.querySelector(`[data-onb="${anchorId}"]`);
}
