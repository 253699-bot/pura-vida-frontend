import { useEffect, useMemo, useState } from 'react';
import { ReceiptText, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../entities/orders/orderApi.js';
import { getOrderRejectionReason } from '../../entities/orders/orderModel.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { ClientPageLayout } from '../../shared/layouts/ClientPageLayout.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import { formatOrderDate, getOrderDateTimeValue } from '../../shared/utils/date.js';
import { OrderStatusBadge } from './components/OrderStatusBadge.jsx';
import './MyOrdersPage.css';

const ORDER_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aceptado', label: 'Aceptados' },
  { value: 'finalizado', label: 'Finalizados' },
  { value: 'rechazado', label: 'Rechazados' },
  { value: 'cancelado', label: 'Cancelados' },
];


function shouldShowEstimatedWait(order) {
  return ['aceptado', 'finalizado'].includes(order.estado)
    && typeof order.tiempoEsperaEstimado === 'string'
    && order.tiempoEsperaEstimado.trim().length > 0;
}

function OrderRejectionReason({ order }) {
  const rejectionReason = getOrderRejectionReason(order);

  if (order.estado !== 'rechazado' || !rejectionReason) {
    return null;
  }

  return (
    <p className="order-card__reason">
      <strong>Motivo:</strong> {rejectionReason}
    </p>
  );
}

function getOrderTimestamp(order) {
  const date = order.fecha || '1970-01-01';
  const time = order.hora || '00:00:00';
  const timestamp = new Date(`${date}T${time}`).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        const data = await getMyOrders();

        if (isMounted) {
          setOrders([...data].sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a)));
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiMessage(requestError, 'No se pudo consultar tu historial de pedidos.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleOrders = useMemo(
    () =>
      activeFilter === 'todos'
        ? orders
        : orders.filter((order) => order.estado === activeFilter),
    [activeFilter, orders],
  );

  return (
    <ClientPageLayout
      className="orders-page"
      title="Historial de pedidos"
      description="Consulta el estado y los detalles de tus pedidos."
      backLabel="Volver al inicio"
    >
      {!isLoading && !error && orders.length ? (
        <div className="orders-filters" aria-label="Filtrar pedidos por estado">
          {ORDER_FILTERS.map((filter) => (
            <button
              type="button"
              className="orders-filter"
              aria-pressed={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
              key={filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? <Loading label="Cargando pedidos..." /> : null}
      <ErrorMessage title="No pudimos cargar tus pedidos" message={error} />

      {!isLoading && !error && !orders.length ? (
        <section className="orders-empty">
          <ReceiptText size={42} strokeWidth={1.8} aria-hidden="true" />
          <EmptyState
            title="Aún no tienes pedidos"
            message="Cuando confirmes un pedido desde el carrito aparecerá en este historial."
          />
          <Link className="button button--primary" to="/menu">
            Ver menú del día
          </Link>
        </section>
      ) : null}

      {!isLoading && !error && orders.length && !visibleOrders.length ? (
        <EmptyState
          title="Sin pedidos en este estado"
          message="Elige otro filtro para consultar tu historial."
        />
      ) : null}

      {visibleOrders.length ? (
        <section className="orders-list" aria-label="Listado de pedidos">
          {visibleOrders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card__heading">
                <div>
                  <div className="order-card__title">
                    <h2>#PV-{order.id}</h2>
                    <OrderStatusBadge status={order.estado} />
                  </div>
                  <time dateTime={getOrderDateTimeValue(order.fecha, order.hora)}>
                    {formatOrderDate(order.fecha, order.hora)}
                  </time>
                </div>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
              <div className="order-card__footer">
                <span>
                  <Utensils size={19} strokeWidth={2} aria-hidden="true" />
                  Consulta los platillos y la respuesta de la fonda en el detalle.
                </span>
                <Link className="order-card__detail" to={`/mis-pedidos/${order.id}`}>
                  Ver detalle
                </Link>
              </div>
              {shouldShowEstimatedWait(order) ? (
                <p className="order-card__estimate">
                  Tiempo estimado para recoger: <strong>{order.tiempoEsperaEstimado.trim()}</strong>
                </p>
              ) : null}
              <OrderRejectionReason order={order} />
            </article>
          ))}
        </section>
      ) : null}
    </ClientPageLayout>
  );
}
