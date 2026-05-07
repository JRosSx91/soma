/**
 * Categoría farmacológica de la sustancia.
 * Se usa para agrupación visual y para asociar patrones de recuperación comunes.
 */
export type SubstanceCategory =
  | 'depressant'       // alcohol
  | 'stimulant'        // cocaína, anfetaminas
  | 'cannabinoid'      // cannabis
  | 'nicotine'         // tabaco, vaping
  | 'opioid'           // heroína, opioides de prescripción
  | 'hallucinogen'     // LSD, psilocibina
  | 'dissociative';    // ketamina, DXM

/**
 * Identificador canónico de sustancia.
 * Mantenemos un enum cerrado para v1 — evita IDs de base de datos en el dominio
 * y permite exhaustiveness checking en el frontend.
 */
export type SubstanceId =
  | 'alcohol'
  | 'nicotine'
  | 'cannabis'
  | 'cocaine'
  | 'caffeine';

export interface Substance {
  id: SubstanceId;
  name: string;
  category: SubstanceCategory;
  /** Descripción breve para la UI. */
  shortDescription: string;
}