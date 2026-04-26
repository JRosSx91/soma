/**
 * Nivel de confianza en la evidencia científica que respalda una curva
 * de recuperación o un perfil de daño.
 *
 * - 'high':   consenso clínico amplio, múltiples estudios longitudinales,
 *             guías clínicas establecidas. Ej: regeneración hepática en
 *             abstinencia alcohólica.
 * - 'medium': literatura sólida pero con variabilidad interindividual
 *             notable o tamaños muestrales limitados. Ej: renormalización
 *             dopaminérgica post-cocaína.
 * - 'low':    evidencia emergente, estudios preliminares o valores
 *             extrapolados de modelos animales. El frontend debe
 *             visualizar la incertidumbre.
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';