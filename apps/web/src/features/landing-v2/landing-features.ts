import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Compass,
  FlaskConical,
  NotebookPen,
  PersonStanding,
  type LucideIcon,
} from "lucide-react";

/** Public demo destinations for the landing feature overview. */
export const LANDING_FEATURE_ITEMS = [
  { id: "recovery", to: "/preview/recovery", icon: Activity },
  { id: "neurotransmitters", to: "/preview/explore", icon: Brain },
  { id: "substances", to: "/preview/explore", icon: FlaskConical },
  { id: "atlas", to: "/preview/anatomy", icon: PersonStanding },
  { id: "journal", to: "/preview/journal", icon: NotebookPen },
  { id: "missions", to: "/preview/missions", icon: BookOpen },
  { id: "achievements", to: "/preview/achievements", icon: Award },
  { id: "expedition", to: "/preview/expedition", icon: Compass },
] as const satisfies readonly { id: string; to: string; icon: LucideIcon }[];
