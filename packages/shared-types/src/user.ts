import type { SubstanceId } from './substances.js';

export type BiologicalSex = 'male' | 'female';

/**
 * Consumo declarado por el usuario para una sustancia.
 * Modelamos "desde cuándo" y "cuánto" por separado para poder calcular
 * daño acumulado vs daño crónico.
 */
export interface SubstanceUsage {
  substanceId: SubstanceId;
  /** Año aproximado en que empezó el consumo regular. */
  yearStarted: number;
  /** Fecha (ISO) del último consumo. Marca el inicio de la curva de recuperación. */
  lastUseDate: string;
  /**
   * Frecuencia de consumo reportada. Categórica para v1 —
   * números precisos son poco fiables en auto-reporte.
   */
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
}

export interface UserProfile {
  id: string;
  displayName: string;
  biologicalSex: BiologicalSex;
  birthYear: number;
  /** Peso en kg. Opcional — mejora la precisión de ciertas curvas pero no es esencial. */
  weightKg?: number;
  /** Sustancias en proceso de abstinencia. */
  usages: SubstanceUsage[];
  /** Fecha (ISO) de creación del perfil. */
  createdAt: string;
}