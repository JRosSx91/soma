import { apiGet } from "../../shared/api/client";
import type { ApiSubstance } from '../../shared/api/types.js';

export async function fetchSubstances(): Promise<ApiSubstance[]> {
  return apiGet<ApiSubstance[]>('/substances');
}