import { Clock, Eye, UserRound } from 'lucide-react';
import { Button } from '../../../shared/ui/Button.jsx';
import { formatCurrency } from '../../../shared/utils/currency.js';

const STATUS_DETAILS = {
  pendiente: { label: 'Pendiente', tone: 'pending' },
  aceptado: { label: 'Aceptado', tone: 'accepted' },
  finalizado: { label: 'Finalizado', tone: 'completed' },
  rechazado: { label: 'Rechazado', tone: 'rejected' },
  cancelado: { label: 'Cancelado', tone: 'cancelled' },
  pending: { label: 'Pendiente', tone: 'pending' },
  accepted: { label: 'Aceptado', tone: 'accepted' },
  completed: { label: 'Finalizado', tone: 'completed' },
  rejected: { label: 'Rechazado', tone: 'rejected' },
  cancelled: { label: 'Cancelado', tone: 'cancelled' }
};

function formatOrderTime(value) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function OrderCard({ order, onAccept, onReject, onComplete, onCancel, onView }) {
  const status = STATUS_DETAILS[order.estado] ?? STATUS_DETAILS.pendiente;
  const isPending = order.estado === 'pendiente' || order.estado === 'pending';
  const isAccepted = order.estado === 'aceptado' || order.estado === 'accepted';

  return (
    <article className="order-card">
      <div className="order-card__header">
        <div>
          <p className="order-card__folio">Pedido {order.folio || `#${order.id}`}</p>
          <div className="order-card__meta">
            <span>
              <UserRound aria-hidden="true" size={16} />
              {order.clienteNombre}
            </span>
            <span>
              <Clock aria-hidden="true" size={16} />
              {formatOrderTime(order.fechaCreacion)}
            </span>
          </div>
        </div>
        <span className={`order-card__status order-card__status--${status.tone}`}>{status.label}</span>
      </div>

      <div className="order-card__items">
        {order.items?.slice(0, 3).map((item) => (
          <span key={item.id ?? item.nombre}>
            {item.cantidad} x {item.nombre}
          </span>
        ))}
        {order.items?.length > 3 ? <span>+{order.items.length - 3} más</span> : null}
      </div>

      {order.notas ? <p className="order-card__notes">Notas: {order.notas}</p> : null}

      <div className="order-card__footer">
        <strong>{formatCurrency(order.total)}</strong>
        <div className="order-card__actions" aria-label="Acciones del pedido">
          {isPending ? (
            <>
              <Button type="button" size="sm" onClick={() => onAccept(order)}>
                Aceptar
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => onReject(order)}>
                Rechazar
              </Button>
            </>
          ) : null}
          {isAccepted ? (
            <>
              <Button type="button" size="sm" onClick={() => onComplete(order)}>
                Finalizar
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => onCancel(order)}>
                Cancelar
              </Button>
            </>
          ) : null}
          <Button type="button" size="sm" variant="ghost" onClick={() => onView(order)}>
            <Eye aria-hidden="true" size={16} />
            Ver detalle
          </Button>
        </div>
      </div>
    </article>
  );
}
