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
<<<<<<< Updated upstream
=======

export async function getAdminOrders({ estado, currentCycleOnly = false, historyOnly = false } = {}) {
  const params = {
    ...(estado ? { estado } : {}),
    ...(currentCycleOnly ? { currentCycleOnly: true } : {}),
    ...(historyOnly ? { historyOnly: true } : {}),
  };
  const response = await httpClient.get(ENDPOINTS.ADMIN_ORDERS, {
    params: Object.keys(params).length ? params : undefined,
  });
  const data = getApiData(response);

  return Array.isArray(data) ? data.map(normalizeAdminOrder).filter(Boolean) : [];
}

export async function getAdminOrder(orderId) {
  const response = await httpClient.get(ENDPOINTS.ADMIN_ORDER(orderId));

  return normalizeAdminOrder(getApiData(response));
}

export async function acceptAdminOrder(orderId, tiempoEsperaEstimado) {
  const response = await httpClient.patch(ENDPOINTS.ADMIN_ORDER_ACCEPT(orderId), {
    tiempoEsperaEstimado,
  });

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

export async function cancelAdminOrder(orderId) {
  const response = await httpClient.patch(ENDPOINTS.ADMIN_ORDER_CANCEL(orderId));

  return normalizeAdminOrder(getApiData(response));
}
>>>>>>> Stashed changes
