import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { httpClient } from '../../shared/api/httpClient.js';
import { normalizeBusinessConfiguration, normalizeBusinessStatus } from './businessModel.js';

export async function getTodayBusinessStatus() {
  const response = await httpClient.get(ENDPOINTS.BUSINESS_STATUS_TODAY);

  return normalizeBusinessStatus(getApiData(response));
}

export async function updateTodayBusinessStatus(payload) {
  const response = await httpClient.put(ENDPOINTS.BUSINESS_STATUS_TODAY, payload);

  return normalizeBusinessStatus(getApiData(response));
}

export async function getBusinessConfiguration() {
  const response = await httpClient.get(ENDPOINTS.BUSINESS_CONFIGURATION);

  return normalizeBusinessConfiguration(getApiData(response));
}

export async function updateBusinessConfiguration(payload) {
  const response = await httpClient.patch(ENDPOINTS.ADMIN_BUSINESS_CONFIGURATION, payload);

  return normalizeBusinessConfiguration(getApiData(response));
}

export async function uploadBusinessLogo(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await httpClient.post(ENDPOINTS.ADMIN_BUSINESS_CONFIGURATION_LOGO, formData);

  return normalizeBusinessConfiguration(getApiData(response));
}
