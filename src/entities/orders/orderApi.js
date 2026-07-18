import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { httpClient } from '../../shared/api/httpClient.js';
import { normalizeOrder, normalizeOrderSummary } from './orderModel.js';

export async function getMyOrders() {
  const response = await httpClient.get(ENDPOINTS.MY_ORDERS);
  const data = getApiData(response);

  return Array.isArray(data) ? data.map(normalizeOrderSummary).filter(Boolean) : [];
}

export async function getMyOrder(orderId) {
  const response = await httpClient.get(ENDPOINTS.MY_ORDER(orderId));

  return normalizeOrder(getApiData(response));
}
