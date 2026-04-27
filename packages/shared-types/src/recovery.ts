import type { ConfidenceLevel } from './evidence.js';
import type { OrganId } from './organs.js';
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

export interface OrganDamageProfile {
  organId: OrganId;
  substanceId: SubstanceId;
  maxSeverity: number;
  confidenceLevel: ConfidenceLevel;
  referenceSource: string;
}

export interface OrganRecoveryCurve {
  organId: OrganId;
  substanceId: SubstanceId;
  shape: RecoveryCurveShape;
  daysTo95Recovery: number;
  recoveryCeiling: number;
  confidenceLevel: ConfidenceLevel;
  referenceSource: string;
}