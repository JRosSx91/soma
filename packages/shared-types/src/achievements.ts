import type { OrganId } from "./organs";
import type { SubstanceId } from './substances.js';

/**
 * Tipo de logro. Estilo PlayStation con jerarquía visual.
 */
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * Condición que dispara el logro. Todo logro está vinculado a un evento
 * fisiológico real, no a meros hitos temporales.
 */
export interface AchievementTrigger {
  /** Qué órgano debe alcanzar qué estado de recuperación. */
  organId: OrganId;
  /** Sustancia en la que aplica este trigger. */
  substanceId: SubstanceId;
  /** Porcentaje de recuperación necesario (0-100). */
  recoveryThreshold: number;
}

export interface Achievement {
  id: string;
  tier: AchievementTier;
  title: string;
  /** Explicación fisiológica real, no motivacional genérica. */
  physiologicalDescription: string;
  trigger: AchievementTrigger;
}