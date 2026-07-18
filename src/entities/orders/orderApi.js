import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { httpClient } from '../../shared/api/httpClient.js';
import {
  normalizeAdminOrder,
  normalizeOrder,
  normalizeOrderSummary,
} from './orderModel.js';

export async function getMyOrders() {
  const response = await httpClient.get(ENDPOINTS.MY_ORDERS);
  const data = getApiData(response);

  return Array.isArray(data) ? data.map(normalizeOrderSummary).filter(Boolean) : [];
}

export async function getMyOrder(orderId) {
  const response = await httpClient.get(ENDPOINTS.MY_ORDER(orderId));

  return normalizeOrder(getApiData(response));
}

export async function getAdminOrders({ estado } = {}) {
  const response = await httpClient.get(ENDPOINTS.ADMIN_ORDERS, {
    params: estado ? { estado } : undefined,
  });
  const data = getApiData(response);

  return Array.isArray(data) ? data.map(normalizeAdminOrder).filter(Boolean) : [];
}

export async function acceptAdminOrder(orderId) {
  const response = await httpClient.patch(ENDPOINTS.ADMIN_ORDER_ACCEPT(orderId));

  return normalizeAdminOrder(getApiData(response));
}

export async function rejectAdminOrder(orderId, motivoRechazo) {
  const response = await httpClient.patch(ENDPOINTS.ADMIN_ORDER_REJECT(orderId), {
    motivoRechazo,
  });

  return normalizeAdminOrder(getApiData(response));
}

export async function completeAdminOrder(orderId) {
  const response = await httpClient.patch(ENDPOINTS.ADMIN_ORDER_COMPLETE(orderId));

  return normalizeAdminOrder(getApiData(response));
}
