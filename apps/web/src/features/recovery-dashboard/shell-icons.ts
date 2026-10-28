import {
  Activity,
  BookOpen,
  Compass,
  Home,
  PersonStanding,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";
import type { ShellIconId } from "./shell-base.js";

export const shellIcons: Record<ShellIconId, LucideIcon> = {
  home: Home,
  activity: Activity,
  compass: Compass,
  personStanding: PersonStanding,
  trophy: Trophy,
  book: BookOpen,
  user: User,
};
