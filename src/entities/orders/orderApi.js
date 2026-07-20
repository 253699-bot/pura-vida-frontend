import { httpClient } from '../../shared/api/httpClient.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { normalizeAdminOrder, normalizeOrder, normalizeOrderSummary } from './orderModel.js';

export async function getMyOrders() {
  const response = await httpClient.get(ENDPOINTS.MY_ORDERS);
  const data = getApiData(response);
  const orders = Array.isArray(data) ? data : data?.items;
  return Array.isArray(orders) ? orders.map(normalizeOrderSummary) : [];
}

export async function getMyOrder(orderId) {
  const response = await httpClient.get(ENDPOINTS.MY_ORDER(orderId));
  return normalizeOrder(getApiData(response));
}

export async function getAdminOrders({ estado, currentCycleOnly = false, historyOnly = false } = {}) {
  const params = {};
  if (estado) {
    params.estado = estado;
  }
  if (currentCycleOnly) {
    params.currentCycleOnly = true;
  }
  if (historyOnly) {
    params.historyOnly = true;
  }

  const response = await httpClient.get(ENDPOINTS.ADMIN_ORDERS, { params });
  const data = getApiData(response);
  const orders = Array.isArray(data) ? data : data?.items;
  return Array.isArray(orders) ? orders.map(normalizeAdminOrder) : [];
}

export async function getAdminOrder(orderId) {
  const response = await httpClient.get(ENDPOINTS.ADMIN_ORDER(orderId));
  return normalizeAdminOrder(getApiData(response));
}

export async function acceptAdminOrder(orderId, tiempoEsperaEstimado) {
  const response = await httpClient.patch(ENDPOINTS.ADMIN_ORDER_ACCEPT(orderId), {
    tiempoEsperaEstimado: String(tiempoEsperaEstimado)
  });
  return normalizeAdminOrder(getApiData(response));
}

export async function rejectAdminOrder(orderId, payload = {}) {
  const response = await httpClient.patch(ENDPOINTS.ADMIN_ORDER_REJECT(orderId), payload);
  return normalizeAdminOrder(getApiData(response));
}

export async function completeAdminOrder(orderId) {
  const response = await httpClient.patch(ENDPOINTS.ADMIN_ORDER_COMPLETE(orderId));
  return normalizeAdminOrder(getApiData(response));
}

export async function cancelAdminOrder(orderId) {
  const response = await httpClient.patch(ENDPOINTS.ADMIN_ORDER_CANCEL(orderId));
  return normalizeAdminOrder(getApiData(response));
}
