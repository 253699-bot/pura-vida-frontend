import { resolveApiAssetUrl } from '../../shared/api/assets.js';

export const ORDER_STATUS_DETAILS = {
  pendiente: { label: 'Pendiente', tone: 'pending' },
  aceptado: { label: 'Aceptado', tone: 'accepted' },
  finalizado: { label: 'Finalizado', tone: 'completed' },
  rechazado: { label: 'Rechazado', tone: 'rejected' },
  cancelado: { label: 'Cancelado', tone: 'cancelled' }
};

const ORDER_STATUS = {
  PENDIENTE: 'pendiente',
  ACEPTADO: 'aceptado',
  FINALIZADO: 'finalizado',
  RECHAZADO: 'rechazado',
  CANCELADO: 'cancelado'
};

function normalizeStatus(status) {
  if (!status) {
    return ORDER_STATUS.PENDIENTE;
  }

  const normalized = String(status).toLowerCase();
  const aliases = {
    pending: ORDER_STATUS.PENDIENTE,
    accepted: ORDER_STATUS.ACEPTADO,
    completed: ORDER_STATUS.FINALIZADO,
    rejected: ORDER_STATUS.RECHAZADO,
    cancelled: ORDER_STATUS.CANCELADO,
    canceled: ORDER_STATUS.CANCELADO
  };

  return aliases[normalized] ?? normalized;
}

export function normalizeOrderItem(item = {}) {
  const rawImageUrl = item.imagenUrl ?? item.imageUrl ?? item.platilloImagenUrl ?? item.dishImageUrl ?? null;

  return {
    id: item.id ?? item.itemId ?? item.detalleId,
    menuItemId: item.menuItemId ?? null,
    platilloId: item.platilloId ?? item.dishId ?? null,
    nombre: item.nombre ?? item.name ?? item.platilloNombre ?? item.dishName ?? 'Platillo sin nombre',
    cantidad: Number(item.cantidad ?? item.quantity ?? 0),
    precioUnitario: Number(item.precioUnitario ?? item.unitPrice ?? item.precio ?? 0),
    subtotal: Number(item.subtotal ?? item.total ?? 0),
    imagenUrl: resolveApiAssetUrl(rawImageUrl)
  };
}

export function normalizeOrderSummary(order = {}) {
  return {
    id: order.id ?? order.orderId,
    clienteId: order.clienteId ?? null,
    clienteNombre: order.clienteNombre ?? order.customerName ?? order.nombreCliente ?? '',
    estado: normalizeStatus(order.estado ?? order.status),
    fecha: order.fecha ?? null,
    hora: order.hora ?? null,
    total: Number(order.total ?? 0),
    fechaCreacion: order.fechaCreacion ?? order.createdAt ?? order.fecha ?? null,
    tiempoEsperaEstimado: order.tiempoEsperaEstimado ?? order.estimatedWaitMinutes ?? null,
    articulos: Number(order.articulos ?? order.itemCount ?? order.totalItems ?? 0)
  };
}

export function normalizeOrder(order = {}) {
  const items = order.items ?? order.detalles ?? order.articulos ?? [];

  return {
    ...normalizeOrderSummary(order),
    notas: order.notas ?? order.notes ?? '',
    motivoRechazo: order.motivoRechazo ?? order.rejectionReason ?? '',
    categoriaRechazo: order.categoriaRechazo ?? order.rejectionCategory ?? '',
    respondidoPor: order.respondidoPor ?? null,
    respondidoEn: order.respondidoEn ?? null,
    fechaAceptacion: order.fechaAceptacion ?? order.acceptedAt ?? null,
    fechaFinalizacion: order.fechaFinalizacion ?? order.completedAt ?? null,
    items: Array.isArray(items) ? items.map(normalizeOrderItem).filter(Boolean) : []
  };
}

function combineOrderDateTime(order = {}) {
  const rawDate = order.fechaCreacion ?? order.createdAt ?? order.fecha ?? order.date ?? null;
  const rawTime = order.horaCreacion ?? order.createdTime ?? order.hora ?? order.time ?? null;
  if (!rawDate || String(rawDate).includes('T') || !rawTime) {
    return rawDate;
  }
  return `${rawDate}T${rawTime}`;
}

export function normalizeAdminOrder(order = {}) {
  const items = order.items ?? order.detalles ?? order.articulos ?? [];

  return {
    id: order.id ?? order.orderId,
    folio: order.folio ?? order.codigo ?? `#${order.id ?? order.orderId ?? ''}`,
    clienteNombre: order.clienteNombre ?? order.customerName ?? order.nombreCliente ?? 'Cliente',
    clienteTelefono: order.clienteTelefono ?? order.customerPhone ?? order.telefonoCliente ?? '',
    estado: normalizeStatus(order.estado ?? order.status),
    total: Number(order.total ?? 0),
    fechaCreacion: combineOrderDateTime(order),
    tiempoEsperaEstimado: order.tiempoEsperaEstimado ?? order.estimatedWaitMinutes ?? null,
    notas: order.notas ?? order.notes ?? '',
    motivoRechazo: order.motivoRechazo ?? order.rejectionReason ?? '',
    categoriaRechazo: order.categoriaRechazo ?? order.rejectionCategory ?? '',
    motivoCancelacion: order.motivoCancelacion ?? order.cancellationReason ?? '',
    fechaAceptacion: order.fechaAceptacion ?? order.acceptedAt ?? null,
    fechaFinalizacion: order.fechaFinalizacion ?? order.completedAt ?? null,
    items: Array.isArray(items) ? items.map(normalizeOrderItem).filter(Boolean) : []
  };
}

export function getOrderStatusDetails(status) {
  return ORDER_STATUS_DETAILS[normalizeStatus(status)] || { label: 'Estado no disponible', tone: 'neutral' };
}
