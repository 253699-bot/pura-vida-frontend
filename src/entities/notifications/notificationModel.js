export const NOTIFICATION_TYPE_DETAILS = {
  sistema: { label: 'Sistema', tone: 'system' },
  pedido_creado: { label: 'Pedido creado', tone: 'pending' },
  pedido_aceptado: { label: 'Pedido aceptado', tone: 'accepted' },
  pedido_rechazado: { label: 'Pedido rechazado', tone: 'rejected' },
  pedido_cancelado: { label: 'Pedido cancelado', tone: 'cancelled' },
};

export function normalizeNotification(notification) {
  if (!notification) {
    return null;
  }

  const tipo = String(notification.tipo || '').toLowerCase();

  return {
    id: notification.id ?? null,
    pedidoId: notification.pedidoId ?? null,
    tipo,
    titulo: notification.titulo ?? 'Notificación',
    mensaje: notification.mensaje ?? '',
    leido: Boolean(notification.leido),
    fecha: notification.fecha ?? null,
    leidoEn: notification.leidoEn ?? null,
  };
}

export function getNotificationTypeDetails(type) {
  return NOTIFICATION_TYPE_DETAILS[type] || { label: 'Notificación', tone: 'system' };
}
