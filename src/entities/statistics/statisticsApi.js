import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { httpClient } from '../../shared/api/httpClient.js';

function addDaysIso(value, days) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeOrders(orders = {}) {
  const pending = Number(orders.pendientes || 0);
  const accepted = Number(orders.aceptados || 0);
  const rejected = Number(orders.rechazados || 0);
  const cancelled = Number(orders.cancelados || 0);

  return {
    pending,
    accepted,
    rejected,
    cancelled,
    total: pending + accepted + rejected + cancelled,
  };
}

function normalizeOrderStatuses(statuses = {}) {
  const pending = Number(statuses.pendientes || 0);
  const accepted = Number(statuses.aceptados || 0);
  const rejected = Number(statuses.rechazados || 0);
  const finalized = Number(statuses.finalizados || 0);

  return {
    pending,
    accepted,
    rejected,
    finalized,
    total: pending + accepted + rejected + finalized,
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

function normalizeDailySales(items = []) {
  return items.map((item) => ({
    date: item.fecha ?? null,
    total: Number(item.total || 0),
    count: Number(item.cantidad || 0),
  })).filter((item) => item.date);
}

function normalizePeriodSales(items = []) {
  return items.map((item) => ({
    label: item.etiqueta || item.desde || 'Periodo',
    from: item.desde ?? null,
    to: item.hasta ?? null,
    total: Number(item.total || 0),
    count: Number(item.cantidad || 0),
  }));
}

function normalizePeakHours(items = []) {
  return items.map((item) => ({
    date: item.fecha ?? null,
    hour: item.hora === null || item.hora === undefined ? null : Number(item.hora),
    count: Number(item.cantidad || 0),
  })).filter((item) => item.date);
}

function normalizeOrdersByWeek(items = []) {
  return items.map((item) => ({
    week: Number(item.semana || 0),
    from: item.desde ?? null,
    to: item.hasta ?? null,
    count: Number(item.cantidad || 0),
  })).filter((item) => item.week > 0);
}

function normalizeHourlySales(items = []) {
  return items.map((item) => ({
    hour: Number(item.hora || 0),
    total: Number(item.total || 0),
    count: Number(item.cantidad || 0),
  })).filter((item) => Number.isInteger(item.hour) && item.hour >= 0 && item.hour <= 23);
}

function normalizeTopDishes(items = []) {
  return items.map((item) => ({
    id: item.platilloId,
    name: item.nombre || 'Platillo sin nombre',
    quantity: Number(item.cantidadVendida || 0),
    total: Number(item.totalGenerado || 0),
  }));
}

function normalizeStatistics({ from, to, sales, orders, orderStatuses, topDishes, salesByDay, salesByHour, salesByPeriod, peakHoursByDay, ordersByWeek }) {
  const normalizedOrders = normalizeOrders(orders);
  const normalizedOrderStatuses = normalizeOrderStatuses(orderStatuses);
  const normalizedSales = normalizeSales(sales);
  const normalizedTopDishes = normalizeTopDishes(topDishes);
  const normalizedSalesByDay = normalizeDailySales(salesByDay);
  const normalizedSalesByHour = normalizeHourlySales(salesByHour);
  const normalizedSalesByPeriod = normalizePeriodSales(salesByPeriod);
  const normalizedPeakHours = normalizePeakHours(peakHoursByDay);
  const normalizedOrdersByWeek = normalizeOrdersByWeek(ordersByWeek);

  return {
    from,
    to,
    orders: normalizedOrders,
    orderStatuses: normalizedOrderStatuses,
    sales: normalizedSales,
    topDishes: normalizedTopDishes,
    salesByDay: normalizedSalesByDay,
    salesByHour: normalizedSalesByHour,
    salesByPeriod: normalizedSalesByPeriod.length ? normalizedSalesByPeriod : normalizedSalesByDay.map((item) => ({
      label: item.date,
      from: item.date,
      to: item.date,
      total: item.total,
      count: item.count,
    })),
    peakHoursByDay: normalizedPeakHours,
    ordersByWeek: normalizedOrdersByWeek,
    hasActivity:
      normalizedOrders.total > 0 ||
      normalizedSales.activeCount > 0 ||
      normalizedSales.cancelledCount > 0 ||
      normalizedTopDishes.length > 0,
  };
}

export async function getWeeklyStatistics(weekStart) {
  return getRangeStatistics(weekStart, addDaysIso(weekStart, 6));
}

export async function getRangeStatistics(from, to) {
  const params = { from, to };
  const [summaryResponse, topDishesResponse, todayResponse] = await Promise.all([
    httpClient.get(ENDPOINTS.ADMIN_DASHBOARD_SUMMARY, { params }),
    httpClient.get(ENDPOINTS.ADMIN_DASHBOARD_TOP_DISHES, { params }),
    httpClient.get(ENDPOINTS.ADMIN_DASHBOARD_TODAY),
  ]);
  const summary = getApiData(summaryResponse);
  const topDishes = getApiData(topDishesResponse);
  const today = getApiData(todayResponse);

  return normalizeStatistics({
    from: summary?.from || from,
    to: summary?.to || to,
    sales: summary?.ventas,
    orders: summary?.pedidos,
    orderStatuses: summary?.pedidosPorEstado,
    topDishes: topDishes?.items,
    salesByDay: summary?.ventasPorDia,
    salesByHour: today?.ventasPorHora,
    salesByPeriod: summary?.ventasPorPeriodo,
    peakHoursByDay: summary?.horasPicoPorDia,
    ordersByWeek: summary?.pedidosPorSemanaMes,
  });
}