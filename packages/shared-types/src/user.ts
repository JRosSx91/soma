import type { SubstanceId } from './substances.js';

export type BiologicalSex = 'male' | 'female';

/**
 * Status of the user's consumption of a given substance.
 * - `abstinent`: the user has stopped using and is tracking recovery.
 *   `lastUseDate` is required in this case.
 * - `active`: the user is actively using and not planning to stop.
 *   `lastUseDate` is null. The organ is shown in damaged state
 *   (during-use phase) rather than recovering.
 */
export type UsageStatus = 'abstinent' | 'active';

/**
 * Consumo declarado por el usuario para una sustancia.
 * Modelamos "desde cuándo" y "cuánto" por separado para poder calcular
 * daño acumulado vs daño crónico.
 */
export interface SubstanceUsage {
  substanceId: SubstanceId;
  /** Año aproximado en que empezó el consumo regular. */
  yearStarted: number;
  /**
   * Fecha (ISO) del último consumo. Marca el inicio de la curva de recuperación.
   * Null cuando `status === 'active'` (el usuario sigue consumiendo).
   */
  lastUseDate: string | null;
  /**
   * Frecuencia de consumo reportada. Categórica para v1 —
   * números precisos son poco fiables en auto-reporte.
   */
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
  /**
   * Whether the user is in abstinence or actively consuming.
   * Default `abstinent` for backwards compatibility with the original
   * flow (only tracking what you've stopped).
   */
  status: UsageStatus;
}

export interface UserProfile {
  id: string;
  displayName: string;
  biologicalSex: BiologicalSex;
  birthYear: number;
  /** Peso en kg. Opcional — mejora la precisión de ciertas curvas pero no es esencial. */
  weightKg?: number;
  /**
   * Sustancias declaradas. Pueden estar en abstinencia (`status: abstinent`)
   * o en consumo activo (`status: active`). El frontend trata ambas con
   * lógicas diferentes.
   */
  usages: SubstanceUsage[];
  /** Fecha (ISO) de creación del perfil. */
  createdAt: string;
}