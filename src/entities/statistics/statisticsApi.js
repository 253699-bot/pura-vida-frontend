import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { httpClient } from '../../shared/api/httpClient.js';

function normalizeOrders(orders = {}) {
  const pending = Number(orders.pendientes || 0);
  const accepted = Number(orders.aceptados || 0);
  const rejected = Number(orders.rechazados || 0);

  return {
    pending,
    accepted,
    rejected,
    total: pending + accepted + rejected,
  };
}

function normalizeSales(sales = {}) {
  return {
    activeTotal: Number(sales.totalActivo || 0),
    cancelledTotal: Number(sales.totalAnulado || 0),
    activeCount: Number(sales.cantidadActivas || 0),
    cancelledCount: Number(sales.cantidadAnuladas || 0),
    manual: {
      count: Number(sales.manuales?.cantidad || 0),
      total: Number(sales.manuales?.total || 0),
    },
    remote: {
      count: Number(sales.remotas?.cantidad || 0),
      total: Number(sales.remotas?.total || 0),
    },
  };
}

function normalizeTopDishes(items = []) {
  return items.map((item) => ({
    id: item.platilloId,
    name: item.nombre || 'Platillo sin nombre',
    quantity: Number(item.cantidadVendida || 0),
    total: Number(item.totalGenerado || 0),
  }));
}

function normalizeStatistics({ from, to, sales, orders, topDishes }) {
  const normalizedOrders = normalizeOrders(orders);
  const normalizedSales = normalizeSales(sales);
  const normalizedTopDishes = normalizeTopDishes(topDishes);

  return {
    from,
    to,
    orders: normalizedOrders,
    sales: normalizedSales,
    topDishes: normalizedTopDishes,
    hasActivity:
      normalizedOrders.total > 0 ||
      normalizedSales.activeCount > 0 ||
      normalizedSales.cancelledCount > 0 ||
      normalizedTopDishes.length > 0,
  };
}

export async function getWeeklyStatistics(weekStart) {
  const response = await httpClient.get(ENDPOINTS.ADMIN_WEEKLY_REPORT_SUMMARY, {
    params: { weekStart },
  });
  const report = getApiData(response);

  return normalizeStatistics({
    from: report?.semanaInicio,
    to: report?.semanaFin,
    sales: report?.ventas,
    orders: report?.pedidos,
    topDishes: report?.topPlatillos,
  });
}

export async function getRangeStatistics(from, to) {
  const params = { from, to };
  const [summaryResponse, topDishesResponse] = await Promise.all([
    httpClient.get(ENDPOINTS.ADMIN_DASHBOARD_SUMMARY, { params }),
    httpClient.get(ENDPOINTS.ADMIN_DASHBOARD_TOP_DISHES, { params }),
  ]);
  const summary = getApiData(summaryResponse);
  const topDishes = getApiData(topDishesResponse);

  return normalizeStatistics({
    from: summary?.from || from,
    to: summary?.to || to,
    sales: summary?.ventas,
    orders: summary?.pedidos,
    topDishes: topDishes?.items,
  });
}
