import { apiGet } from '../../shared/api/index.js';
import type { ApiSubstance } from '../../shared/api/types.js';

export async function fetchSubstances(): Promise<ApiSubstance[]> {
  return apiGet<ApiSubstance[]>('/substances');
}