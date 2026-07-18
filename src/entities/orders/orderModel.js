export const ORDER_STATUS_DETAILS = {
  pendiente: { label: 'Pendiente', tone: 'pending' },
  aceptado: { label: 'Aceptado', tone: 'accepted' },
  finalizado: { label: 'Finalizado', tone: 'completed' },
  rechazado: { label: 'Rechazado', tone: 'rejected' },
  cancelado: { label: 'Cancelado', tone: 'cancelled' },
};

function normalizeOrderStatus(value) {
  return String(value || '').toLowerCase();
}

export function normalizeOrderItem(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.id ?? null,
    menuItemId: item.menuItemId ?? null,
    platilloId: item.platilloId ?? null,
    nombre: item.nombre ?? 'Platillo sin nombre',
    cantidad: Number(item.cantidad || 0),
    precioUnitario: Number(item.precioUnitario || 0),
    subtotal: Number(item.subtotal || 0),
  };
}

export function normalizeOrder(order) {
  if (!order) {
    return null;
  }

  return {
    id: order.id ?? null,
    clienteId: order.clienteId ?? null,
    clienteNombre: order.clienteNombre ?? '',
    estado: normalizeOrderStatus(order.estado),
    fecha: order.fecha ?? null,
    hora: order.hora ?? null,
    total: Number(order.total || 0),
    notas: order.notas ?? '',
    motivoRechazo: order.motivoRechazo ?? '',
    respondidoPor: order.respondidoPor ?? null,
    respondidoEn: order.respondidoEn ?? null,
    items: Array.isArray(order.items)
      ? order.items.map(normalizeOrderItem).filter(Boolean)
      : [],
  };
}

export function normalizeOrderSummary(order) {
  const normalized = normalizeOrder(order);

  if (!normalized) {
    return null;
  }

  const { items, ...summary } = normalized;
  return summary;
}

function combineOrderDateTime(fecha, hora) {
  if (fecha && hora) {
    return `${fecha}T${hora}`;
  }

  return fecha || hora || null;
}

export function normalizeAdminOrder(order) {
  if (!order) {
    return null;
  }

  const backendOrder = {
    ...order,
    id: order.id ?? order.idPedido ?? null,
    estado: order.estado ?? order.status,
  };
  const normalized = normalizeOrder(backendOrder);

  return {
    ...order,
    id: normalized.id,
    status: normalized.estado,
    customerName: normalized.clienteNombre || order.customerName || '',
    createdAt: order.createdAt || combineOrderDateTime(normalized.fecha, normalized.hora),
    total: normalized.total,
    source: order.origen ?? order.source ?? null,
    notes: normalized.notas,
    rejectionReason: normalized.motivoRechazo,
    items: normalized.items.map((item) => ({
      ...item,
      name: item.nombre,
      quantity: item.cantidad,
    })),
    raw: order,
  };
}

export function getOrderStatusDetails(status) {
  return ORDER_STATUS_DETAILS[status] || { label: 'Estado no disponible', tone: 'neutral' };
}
