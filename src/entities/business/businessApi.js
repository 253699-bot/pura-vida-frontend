import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { httpClient } from '../../shared/api/httpClient.js';
import { normalizeBusinessStatus } from './businessModel.js';

export async function getTodayBusinessStatus() {
  const response = await httpClient.get(ENDPOINTS.BUSINESS_STATUS_TODAY);

  return normalizeBusinessStatus(getApiData(response));
}

export async function updateTodayBusinessStatus(payload) {
  const response = await httpClient.put(ENDPOINTS.BUSINESS_STATUS_TODAY, payload);

  return normalizeBusinessStatus(getApiData(response));
}
