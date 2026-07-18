import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, Utensils } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getMyOrder } from '../../entities/orders/orderApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { ClientPageLayout } from '../../shared/layouts/ClientPageLayout.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import {
  formatDateTime,
  formatOrderDate,
  getOrderDateTimeValue,
} from '../../shared/utils/date.js';
import { OrderStatusBadge } from './components/OrderStatusBadge.jsx';
import './OrderDetailPage.css';

const STATUS_MESSAGES = {
  pendiente: {
    icon: Clock3,
    title: 'Pedido en revisión',
    message: 'La fonda está revisando tu pedido. Recibirás una notificación con la respuesta.',
    tone: 'pending',
  },
  aceptado: {
    icon: CheckCircle2,
    title: 'Pedido aceptado',
    message: 'La fonda confirmó tu pedido y continuará con su preparación.',
    tone: 'accepted',
  },
  finalizado: {
    icon: CheckCircle2,
    title: 'Pedido finalizado',
    message: 'Este pedido fue marcado como finalizado por la fonda.',
    tone: 'completed',
  },
  cancelado: {
    icon: AlertCircle,
    title: 'Pedido cancelado',
    message: 'Este pedido fue cancelado.',
    tone: 'cancelled',
  },
};

function OrderResponseMessage({ order }) {
  if (order.estado === 'rechazado') {
    return (
      <section className="order-response order-response--rejected">
        <AlertCircle size={22} aria-hidden="true" />
        <div>
          <strong>Motivo de rechazo</strong>
          <span>{order.motivoRechazo || 'La fonda no proporcionó un motivo.'}</span>
        </div>
      </section>
    );
  }

  const response = STATUS_MESSAGES[order.estado];

  if (!response) {
    return null;
  }

  const Icon = response.icon;

  return (
    <section className={`order-response order-response--${response.tone}`}>
      <Icon size={22} aria-hidden="true" />
      <div>
        <strong>{response.title}</strong>
        <span>{response.message}</span>
        {order.respondidoEn ? <small>Respuesta: {formatDateTime(order.respondidoEn)}</small> : null}
      </div>
    </section>
  );
}

export function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      try {
        const data = await getMyOrder(orderId);

        if (isMounted) {
          setOrder(data);
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiMessage(requestError, 'No se pudo consultar este pedido.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  return (
    <ClientPageLayout
      className="order-detail-page"
      title="Detalles del pedido"
      backTo="/mis-pedidos"
      backLabel="Volver al historial"
    >
      {isLoading ? <Loading label="Cargando detalle del pedido..." /> : null}
      <ErrorMessage title="No pudimos cargar el pedido" message={error} />

      {!isLoading && !error && order ? (
        <div className="order-detail">
          <section className="order-detail__summary">
            <div className="order-detail__title">
              <div>
                <h2>Pedido #PV-{order.id}</h2>
                <time dateTime={getOrderDateTimeValue(order.fecha, order.hora)}>
                  {formatOrderDate(order.fecha, order.hora)}
                </time>
              </div>
              <OrderStatusBadge status={order.estado} />
            </div>
            <div className="order-detail__total">
              <span>Total</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
          </section>

          <OrderResponseMessage order={order} />

          <section className="order-detail__items">
            <h2>Platillos solicitados</h2>
            {order.items.length ? (
              <div className="order-detail__item-list">
                {order.items.map((item) => (
                  <article className="order-detail__item" key={item.id ?? item.platilloId}>
                    <span aria-hidden="true">
                      <Utensils size={24} strokeWidth={1.8} />
                    </span>
                    <div>
                      <strong>{item.nombre}</strong>
                      <small>
                        {item.cantidad} × {formatCurrency(item.precioUnitario)}
                      </small>
                    </div>
                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </article>
                ))}
              </div>
            ) : (
              <p className="order-detail__missing">No hay platillos disponibles en el detalle.</p>
            )}
          </section>

          {order.notas ? (
            <section className="order-detail__notes">
              <h2>Notas del pedido</h2>
              <p>{order.notas}</p>
            </section>
          ) : null}

          <div className="order-detail__actions">
            <Link className="button button--primary" to="/mis-pedidos">
              Volver al historial
            </Link>
            <Link className="button button--secondary" to="/menu">
              Ver menú del día
            </Link>
          </div>
        </div>
      ) : null}
    </ClientPageLayout>
  );
}
