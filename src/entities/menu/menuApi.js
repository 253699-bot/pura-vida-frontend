import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { httpClient } from '../../shared/api/httpClient.js';
<<<<<<< Updated upstream
import { normalizeMenuItem, normalizeTodayMenu } from './menuModel.js';
=======
import { normalizeDish, normalizeMenuItem, normalizeTodayMenu } from './menuModel.js';

export async function getAdminDishes() {
  const response = await httpClient.get(ENDPOINTS.ADMIN_DISHES);
  const dishes = getApiData(response);

  return Array.isArray(dishes) ? dishes.map(normalizeDish).filter(Boolean) : [];
}

export async function createDish(payload) {
  const response = await httpClient.post(ENDPOINTS.ADMIN_DISHES, payload);

  return normalizeDish(getApiData(response));
}

export async function updateDish(id, payload) {
  const response = await httpClient.put(ENDPOINTS.ADMIN_DISH(id), payload);

  return normalizeDish(getApiData(response));
}


export async function uploadDishImage(id, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await httpClient.post(ENDPOINTS.ADMIN_DISH_IMAGE(id), formData);

  return normalizeDish(getApiData(response));
}
export async function deleteDish(id) {
  const response = await httpClient.delete(ENDPOINTS.ADMIN_DISH(id));

  return normalizeDish(getApiData(response));
}
>>>>>>> Stashed changes

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
