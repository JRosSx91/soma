import { apiGet } from "../../shared/api/client";
import type { ApiSubstance } from '../../shared/api/types.js';

/**
 * Fetches the full substance catalog from the API, including damage
 * profiles, recovery curves, and achievements for each substance.
 */
export async function fetchSubstances(): Promise<ApiSubstance[]> {
  return apiGet<ApiSubstance[]>('/substances');
}