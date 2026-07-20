import { httpClient } from '../../shared/api/httpClient.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { normalizeDish, normalizeMenuItem, normalizeTodayMenu } from './menuModel.js';

export async function getTodayMenu() {
  const response = await httpClient.get(ENDPOINTS.MENU_TODAY);
  return normalizeTodayMenu(getApiData(response));
}

export async function updateMenuItemAvailability(menuItemId, nextAvailability) {
  const payload = typeof nextAvailability === 'object'
    ? nextAvailability
    : { disponible: nextAvailability };
  const response = await httpClient.patch(ENDPOINTS.MENU_ITEM_AVAILABILITY(menuItemId), payload);
  return normalizeMenuItem(getApiData(response));
}

export async function updateTodayMenu(payload = {}) {
  const response = await httpClient.put(ENDPOINTS.MENU_TODAY, payload);
  return normalizeTodayMenu(getApiData(response));
}

export async function getAdminDishes() {
  const response = await httpClient.get(ENDPOINTS.ADMIN_DISHES);
  const data = getApiData(response);
  const dishes = Array.isArray(data) ? data : data?.items;
  return Array.isArray(dishes) ? dishes.map(normalizeDish) : [];
}

export async function createDish(payload) {
  const response = await httpClient.post(ENDPOINTS.ADMIN_DISHES, payload);
  return normalizeDish(getApiData(response));
}

export async function updateDish(dishId, payload) {
  const response = await httpClient.put(ENDPOINTS.ADMIN_DISH(dishId), payload);
  return normalizeDish(getApiData(response));
}

export async function uploadDishImage(dishId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await httpClient.post(ENDPOINTS.ADMIN_DISH_IMAGE(dishId), formData);
  return normalizeDish(getApiData(response));
}

export async function deleteDish(dishId) {
  await httpClient.delete(ENDPOINTS.ADMIN_DISH(dishId));
}
