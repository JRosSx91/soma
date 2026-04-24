import type { OrganId } from "./organs";
import type { SubstanceId } from './substances.js';

/**
 * Forma matemática de la curva de recuperación de un órgano
 * tras cese de consumo.
 *
 * - 'logarithmic':   recuperación rápida al inicio, asintótica. Típica en
 *                    regeneración hepática, función ciliar bronquial.
 * - 'sigmoidal':     lenta al inicio, acelera, se aplana. Típica en
 *                    renormalización de receptores dopaminérgicos.
 * - 'linear':        progreso constante. Raro, usado solo cuando los datos
 *                    no justifican otra forma.
 * - 'stepwise':      hitos discretos. Usado cuando la literatura reporta
 *                    cambios por umbrales temporales más que por función
 *                    continua.
 */
export type RecoveryCurveShape =
  | 'logarithmic'
  | 'sigmoidal'
  | 'linear'
  | 'stepwise';

/**
 * Estado basal de daño de un órgano dada una sustancia consumida.
 * El daño real en un usuario concreto se calcula combinando este baseline
 * con los años de consumo y variables de perfil.
 */
export interface OrganDamageProfile {
  organId: OrganId;
  substanceId: SubstanceId;
  /**
   * Severidad máxima alcanzable para esta sustancia sobre este órgano,
   * en consumo crónico típico. Escala 0-100.
   *
   * No es un valor absoluto médico — es una normalización interna para
   * alimentar la visualización. El mapeo a realidad se documenta en
   * `/docs/recovery-curves/`.
   */
  maxSeverity: number;
  /** Documentación: DOI o URL del paper principal que sustenta este valor. */
  referenceSource: string;
}

/**
 * Curva de recuperación de un órgano tras cese de consumo.
 */
export interface OrganRecoveryCurve {
  organId: OrganId;
  substanceId: SubstanceId;
  shape: RecoveryCurveShape;
  /**
   * Duración, en días, para alcanzar el 95% de la recuperación asintótica
   * bajo condiciones estándar (sin comorbilidad, sin policonsumo).
   */
  daysTo95Recovery: number;
  /**
   * Techo de recuperación alcanzable. Algunos daños son parcialmente
   * irreversibles (ej. fibrosis hepática avanzada, pérdida neuronal).
   * 1.0 = recuperación completa; 0.7 = 70% del estado pre-consumo.
   */
  recoveryCeiling: number;
  /** Documentación: DOI o URL del paper principal. */
  referenceSource: string;
}