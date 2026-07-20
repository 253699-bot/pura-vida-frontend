import { getApiData } from '../../shared/api/apiResponse.js';
import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { httpClient } from '../../shared/api/httpClient.js';

function normalizeSaleItem(item) {
  if (!item) return null;

  return {
    id: item.id ?? null,
    menuItemId: item.menuItemId ?? null,
    platilloId: item.platilloId ?? null,
    nombre: item.nombre || 'Platillo sin nombre',
    cantidad: Number(item.cantidad || 0),
    precioUnitario: Number(item.precioUnitario || 0),
    subtotal: Number(item.subtotal || 0),
  };
}

function normalizeSale(sale) {
  if (!sale) return null;

  return {
    id: sale.id ?? null,
    pedidoId: sale.pedidoId ?? null,
    fuente: sale.fuente ?? null,
    estado: sale.estado ?? null,
    fecha: sale.fecha ?? null,
    hora: sale.hora ?? null,
    total: Number(sale.total || 0),
    registradoPor: sale.registradoPor ?? null,
    observaciones: sale.observaciones || '',
    creadoEn: sale.creadoEn || null,
    items: Array.isArray(sale.items) ? sale.items.map(normalizeSaleItem).filter(Boolean) : [],
  };
}

export async function createManualSale(payload, idempotencyKey) {
  const response = await httpClient.post(ENDPOINTS.ADMIN_MANUAL_SALES, payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });

  return normalizeSale(getApiData(response));
}
