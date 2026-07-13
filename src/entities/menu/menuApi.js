import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { httpClient } from '../../shared/api/httpClient.js';
import { normalizeMenuItem, normalizeTodayMenu } from './menuModel.js';

export async function getTodayMenu() {
  const response = await httpClient.get(ENDPOINTS.MENU_TODAY);

  return normalizeTodayMenu(getApiData(response));
}

export async function updateTodayMenu(payload) {
  const response = await httpClient.put(ENDPOINTS.MENU_TODAY, payload);

  return normalizeTodayMenu(getApiData(response));
}

export async function updateMenuItemAvailability(id, payload) {
  const response = await httpClient.patch(ENDPOINTS.MENU_ITEM_AVAILABILITY(id), payload);

  return normalizeMenuItem(getApiData(response));
}
