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
  shortDescription: string;
}