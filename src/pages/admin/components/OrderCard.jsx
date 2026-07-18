import { Clock3, MessageSquareText } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { Card } from '../../../shared/ui/Card.jsx';

const STATUS_PRESENTATION = {
  pending: { label: 'Pendiente', tone: 'pending' },
  accepted: { label: 'Aceptado', tone: 'accepted' },
  rejected: { label: 'Rechazado', tone: 'rejected' },
  completed: { label: 'Finalizado', tone: 'completed' },
};

const STATUS_ALIASES = {
  pendiente: 'pending',
  pending: 'pending',
  aceptado: 'accepted',
  accepted: 'accepted',
  rechazado: 'rejected',
  rejected: 'rejected',
  entregado: 'completed',
  finalizado: 'completed',
  completed: 'completed',
};

function getStatusPresentation(status) {
  const normalizedStatus = STATUS_ALIASES[String(status || '').toLowerCase()] || 'pending';

  return {
    key: normalizedStatus,
    ...STATUS_PRESENTATION[normalizedStatus],
  };
}

function formatOrderTime(value) {
  if (!value) {
    return 'Hora no disponible';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function OrderCard({
  order,
  actionsAvailable = false,
  isUpdating = false,
  onAccept,
  onReject,
}) {
  const status = getStatusPresentation(order.status);
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <Card className="admin-order-card">
      <header className="admin-order-card__header">
        <div>
          <h2>{order.customerName || 'Cliente'}</h2>
          <p>
            <Clock3 size={15} strokeWidth={2} aria-hidden="true" />
            {formatOrderTime(order.createdAt)}
          </p>
        </div>
        <span className={`admin-order-status admin-order-status--${status.tone}`}>
          {status.label}
        </span>
      </header>

      <div className="admin-order-card__items">
        {items.map((item, index) => (
          <div className="admin-order-card__item" key={item.id || `${item.name}-${index}`}>
            <span>
              <strong>{item.quantity || 1}x</strong>
              {item.name}
            </span>
            {item.subtotal !== undefined ? <strong>{formatCurrency(item.subtotal)}</strong> : null}
          </div>
        ))}
        {!items.length ? <p className="admin-order-card__no-items">Sin detalle de platillos.</p> : null}
      </div>

      {order.notes ? (
        <p className="admin-order-card__notes">
          <MessageSquareText size={16} strokeWidth={2} aria-hidden="true" />
          <span>
            <strong>Observaciones</strong>
            {order.notes}
          </span>
        </p>
      ) : null}

      {order.total !== undefined ? (
        <div className="admin-order-card__total">
          <span>Total</span>
          <strong>{formatCurrency(order.total)}</strong>
        </div>
      ) : null}

      {status.key === 'pending' ? (
        <div className="admin-order-card__actions">
          <Button
            onClick={() => onAccept?.(order)}
            disabled={!actionsAvailable || isUpdating}
            title={!actionsAvailable ? 'Disponible cuando exista el endpoint de pedidos' : undefined}
          >
            {isUpdating ? 'Actualizando...' : 'Aceptar'}
          </Button>
          <Button
            variant="danger"
            onClick={() => onReject?.(order)}
            disabled={!actionsAvailable || isUpdating}
            title={!actionsAvailable ? 'Disponible cuando exista el endpoint de pedidos' : undefined}
          >
            Rechazar
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
