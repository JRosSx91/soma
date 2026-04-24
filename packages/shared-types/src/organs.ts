/**
 * Sistemas corporales. La visualización 3D/SVG se organiza por sistemas
 * para permitir capas on/off y agrupación de logros.
 */
export type BodySystem =
  | 'respiratory'
  | 'cardiovascular'
  | 'hepatic'
  | 'renal'
  | 'nervous-central'
  | 'nervous-peripheral'
  | 'endocrine'
  | 'reproductive'
  | 'digestive'
  | 'immune'
  | 'integumentary';

/**
 * Identificador canónico de órgano/estructura.
 * Granularidad intencionalmente fina: "brain" se divide en estructuras
 * relevantes para recuperación (prefrontal cortex, hippocampus, VTA, etc.)
 * porque los patrones de recuperación difieren entre ellas.
 */
export type OrganId =
  | 'liver'
  | 'heart'
  | 'lungs'
  | 'bronchi'
  | 'kidneys'
  | 'stomach'
  | 'pancreas'
  | 'brain-prefrontal-cortex'
  | 'brain-hippocampus'
  | 'brain-vta'              // área tegmental ventral (dopamina)
  | 'brain-nucleus-accumbens'
  | 'brain-amygdala'
  | 'skin'
  | 'testes'
  | 'ovaries';

export interface Organ {
  id: OrganId;
  name: string;
  system: BodySystem;
  /** Descripción anatómica/funcional breve para tooltips. */
  shortDescription: string;
}