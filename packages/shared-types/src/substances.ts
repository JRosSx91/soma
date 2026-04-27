export type SubstanceCategory =
  | 'depressant'       // alcohol
  | 'stimulant'        // cocaína, anfetaminas
  | 'cannabinoid'      // cannabis
  | 'nicotine'         // tabaco, vaping
  | 'opioid'           // heroína, opioides de prescripción
  | 'hallucinogen'     // LSD, psilocibina
  | 'dissociative';    // ketamina, DXM

export type SubstanceId =
  | 'alcohol'
  | 'nicotine'
  | 'cannabis'
  | 'cocaine';

export interface Substance {
  id: SubstanceId;
  name: string;
  category: SubstanceCategory;
  shortDescription: string;
}