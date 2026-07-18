import { getApiData } from '../../shared/api/apiResponse.js';
import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { httpClient } from '../../shared/api/httpClient.js';

export async function createManualSale(payload) {
  const response = await httpClient.post(ENDPOINTS.ADMIN_MANUAL_SALES, payload);
  return getApiData(response);
}
