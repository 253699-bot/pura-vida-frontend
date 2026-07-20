import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  acceptAdminOrder,
  cancelAdminOrder,
  completeAdminOrder,
  getAdminOrder,
  getAdminOrders,
  rejectAdminOrder
} from '../../entities/orders/orderApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import { AdminHeaderActions } from './components/AdminHeaderActions.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';
import { OrderCard } from './components/OrderCard.jsx';
import './AdminOrdersPage.css';
import './components/AdminPageHeader.css';

const CURRENT_ORDER_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aceptado', label: 'Aceptados' },
  { value: 'finalizado', label: 'Finalizados' },
  { value: 'rechazado', label: 'Rechazados' },
  { value: 'cancelado', label: 'Cancelados' }
];

const HISTORY_ORDER_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'finalizado', label: 'Finalizados' },
  { value: 'rechazado', label: 'Rechazados' },
  { value: 'cancelado', label: 'Cancelados' }
];

const REJECTION_CATEGORIES = [
  { value: 'sin_stock', label: 'Sin stock' },
  { value: 'fuera_horario', label: 'Fuera de horario' },
  { value: 'otro', label: 'Otro' }
];

const STATUS_ALIASES = {
  pending: 'pendiente',
  accepted: 'aceptado',
  completed: 'finalizado',
  rejected: 'rechazado',
  cancelled: 'cancelado',
  canceled: 'cancelado'
};

function normalizeStatus(status) {
  const normalized = String(status ?? '').toLowerCase();
  return STATUS_ALIASES[normalized] ?? normalized;
}

function orderMatchesSearch(order, searchTerm) {
  if (!searchTerm.trim()) {
    return true;
  }

  const needle = searchTerm.trim().toLowerCase();
  return [order.folio, order.clienteNombre, order.clienteTelefono]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
}

function updateOrderInList(orderList, updatedOrder) {
  return orderList.map((order) => (order.id === updatedOrder.id ? updatedOrder : order));
}

function OrderDetailDialog({ order, loading, error, onClose }) {
  const isOpen = Boolean(order || loading || error);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="dish-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="dish-dialog" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
        <header className="dish-dialog__header">
          <div>
            <p>Detalle del pedido</p>
            <h2 id="order-detail-title">{order?.folio || 'Consultando pedido'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar detalle">
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        {loading ? <Loading message="Consultando pedido..." /> : null}
        {error ? <ErrorMessage message={error} /> : null}
        {order ? (
          <div className="admin-order-detail">
            <dl>
              <div>
                <dt>Cliente</dt>
                <dd>{order.clienteNombre}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{order.clienteTelefono || 'No registrado'}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{order.estado}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
              {order.tiempoEsperaEstimado ? (
                <div>
                  <dt>Tiempo estimado</dt>
                  <dd>{order.tiempoEsperaEstimado}</dd>
                </div>
              ) : null}
              {order.notas ? (
                <div>
                  <dt>Notas</dt>
                  <dd>{order.notas}</dd>
                </div>
              ) : null}
              {order.motivoRechazo ? (
                <div>
                  <dt>Motivo de rechazo</dt>
                  <dd>{order.motivoRechazo}</dd>
                </div>
              ) : null}
            </dl>

            <div className="admin-order-detail__items">
              {order.items?.map((item) => (
                <div key={item.id ?? item.nombre}>
                  <span>
                    {item.cantidad} x {item.nombre}
                  </span>
                  <strong>{formatCurrency(item.subtotal)}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export function AdminOrdersPage({ history = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = history ? HISTORY_ORDER_FILTERS : CURRENT_ORDER_FILTERS;
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState(filters[0].value);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [acceptOrder, setAcceptOrder] = useState(null);
  const [acceptMinutes, setAcceptMinutes] = useState('25');
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectCategory, setRejectCategory] = useState(REJECTION_CATEGORIES[0].value);
  const [confirmOrder, setConfirmOrder] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const detailRequestRef = useRef(0);
  const suppressedDetailOrderIdRef = useRef(null);

  useEffect(() => {
    setActiveFilter(filters[0].value);
    setOrders([]);
    setSearchTerm('');
    setActionError('');
    setActionMessage('');
  }, [filters, history]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const estado = activeFilter === 'todos' ? undefined : activeFilter;
      const fetched = await getAdminOrders({
        estado,
        currentCycleOnly: !history,
        historyOnly: history
      });
      const validOrders = history
        ? fetched.filter((order) => ['finalizado', 'rechazado', 'cancelado'].includes(normalizeStatus(order.estado)))
        : fetched;
      setOrders(validOrders);
    } catch (err) {
      setError(getApiMessage(err, 'No se pudieron consultar los pedidos.'));
    } finally {
      setLoading(false);
    }
  }, [activeFilter, history]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const openDetail = useCallback(async (order) => {
    suppressedDetailOrderIdRef.current = null;
    const requestId = detailRequestRef.current + 1;
    detailRequestRef.current = requestId;
    setDetailOrder(order);
    setDetailLoading(true);
    setDetailError('');
    setSearchParams((params) => {
      const nextParams = new URLSearchParams(params);
      nextParams.set('orderId', order.id);
      return nextParams;
    });
    try {
      const fullOrder = await getAdminOrder(order.id);
      if (detailRequestRef.current === requestId) {
        setDetailOrder(fullOrder);
      }
    } catch (err) {
      if (detailRequestRef.current === requestId) {
        setDetailError(getApiMessage(err, 'No se pudo consultar el detalle del pedido.'));
      }
    } finally {
      if (detailRequestRef.current === requestId) {
        setDetailLoading(false);
      }
    }
  }, [setSearchParams]);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      suppressedDetailOrderIdRef.current = null;
      return;
    }
    if (suppressedDetailOrderIdRef.current === String(orderId) || detailOrder?.id === Number(orderId)) {
      return;
    }
    const found = orders.find((order) => String(order.id) === String(orderId));
    if (found) {
      openDetail(found);
    }
  }, [detailOrder?.id, openDetail, orders, searchParams]);

  const closeDetail = useCallback(() => {
    const closingOrderId = detailOrder?.id ?? searchParams.get('orderId');
    if (closingOrderId != null) {
      suppressedDetailOrderIdRef.current = String(closingOrderId);
    }
    detailRequestRef.current += 1;
    setDetailOrder(null);
    setDetailLoading(false);
    setDetailError('');
    setSearchParams((params) => {
      const nextParams = new URLSearchParams(params);
      nextParams.delete('orderId');
      return nextParams;
    });
  }, [detailOrder?.id, searchParams, setSearchParams]);

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter = activeFilter === 'todos' || normalizeStatus(order.estado) === activeFilter;
      return matchesFilter && orderMatchesSearch(order, searchTerm);
    });
  }, [activeFilter, orders, searchTerm]);

  async function performOrderAction(action, successMessage) {
    setIsSubmitting(true);
    setActionError('');
    setActionMessage('');
    try {
      const updatedOrder = await action();
      setOrders((current) => updateOrderInList(current, updatedOrder));
      setDetailOrder((current) => (current?.id === updatedOrder.id ? updatedOrder : current));
      setActionMessage(successMessage);
      setAcceptOrder(null);
      setRejectOrder(null);
      setConfirmOrder(null);
      setConfirmAction(null);
    } catch (err) {
      setActionError(getApiMessage(err, 'No se pudo actualizar el pedido.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const openAcceptDialog = (order) => {
    setAcceptOrder(order);
    setAcceptMinutes(order.tiempoEsperaEstimado ? String(order.tiempoEsperaEstimado) : '25');
    setActionError('');
  };

  const handleAccept = () => {
    const minutes = Number(acceptMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setActionError('Captura un tiempo estimado válido en minutos.');
      return;
    }
    performOrderAction(
      () => acceptAdminOrder(acceptOrder.id, String(minutes) + ' minutos'),
      `Pedido ${acceptOrder.folio || `#${acceptOrder.id}`} aceptado.`
    );
  };

  const openRejectDialog = (order) => {
    setRejectOrder(order);
    setRejectReason('');
    setRejectCategory(REJECTION_CATEGORIES[0].value);
    setActionError('');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setActionError('Escribe el motivo del rechazo.');
      return;
    }
    performOrderAction(
      () => rejectAdminOrder(rejectOrder.id, { motivoRechazo: rejectReason.trim() }),
      `Pedido ${rejectOrder.folio || `#${rejectOrder.id}`} rechazado.`
    );
  };

  const openConfirmDialog = (order, action) => {
    setConfirmOrder(order);
    setConfirmAction(action);
    setActionError('');
  };

  const handleConfirm = () => {
    if (!confirmOrder || !confirmAction) {
      return;
    }
    if (confirmAction === 'complete') {
      performOrderAction(
        () => completeAdminOrder(confirmOrder.id),
        `Pedido ${confirmOrder.folio || `#${confirmOrder.id}`} finalizado.`
      );
      return;
    }
    performOrderAction(
      () => cancelAdminOrder(confirmOrder.id),
      `Pedido ${confirmOrder.folio || `#${confirmOrder.id}`} cancelado.`
    );
  };

  const headerCopy = history
    ? {
        eyebrow: 'HISTORIAL',
        title: 'Historial de pedidos',
        subtitle: 'Consulta pedidos finalizados, rechazados y cancelados de jornadas anteriores.'
      }
    : {
        eyebrow: 'PEDIDOS',
        title: 'Gestión de pedidos',
        subtitle: 'Gestiona únicamente los pedidos de la jornada abierta actual.'
      };

  return (
    <div className="admin-orders-page">
      <AdminWorkspaceSidebar activePath="/admin/orders" />
      <main className="admin-orders-page__main">
        <header className="admin-orders-page__header">
          <div>
            <p className="admin-page-header__eyebrow">{headerCopy.eyebrow}</p>
            <h1 className="admin-page-header__title">{headerCopy.title}</h1>
            <span className="admin-page-header__subtitle">{headerCopy.subtitle}</span>
          </div>
          <div className="admin-orders-page__actions">
            <AdminHeaderActions />
          </div>
        </header>

        <section className="admin-orders-page__content">
          <div className="admin-orders-page__topbar">
            <label className="admin-orders-search">
              <Search aria-hidden="true" size={18} />
              <span className="admin-orders-search__label">Buscar pedido</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Folio, cliente o teléfono"
              />
            </label>
            <div className="admin-orders-toolbar__actions">
              {history ? (
                <Link to="/admin/orders" className="button button--secondary button--md admin-orders-history-link">
                  Pedidos actuales
                </Link>
              ) : (
                <Link to="/admin/orders/history" className="button button--secondary button--md admin-orders-history-link">
                  Historial de pedidos
                </Link>
              )}
            </div>
          </div>

        <div className="admin-orders-filters" role="group" aria-label="Filtros de pedidos">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter.value}
              className={`admin-orders-filter ${activeFilter === filter.value ? 'admin-orders-filter--active' : ''}`}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {actionError ? <ErrorMessage message={actionError} /> : null}
        {actionMessage ? <p className="admin-orders-page__notice">{actionMessage}</p> : null}
        {error ? <ErrorMessage message={error} /> : null}

        {loading ? (
          <Loading message="Consultando pedidos..." />
        ) : visibleOrders.length ? (
          <section className="admin-orders-grid" aria-label="Listado de pedidos">
            {visibleOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={openAcceptDialog}
                onReject={openRejectDialog}
                onComplete={(selectedOrder) => openConfirmDialog(selectedOrder, 'complete')}
                onCancel={(selectedOrder) => openConfirmDialog(selectedOrder, 'cancel')}
                onView={openDetail}
              />
            ))}
          </section>
        ) : (
          <div className="admin-orders-empty">
            <EmptyState
              title={history ? 'Sin pedidos históricos' : 'Sin pedidos actuales'}
              description={
                history
                  ? 'Los pedidos finalizados, rechazados o cancelados aparecerán aquí.'
                  : 'Cuando la fonda esté cerrada o la jornada inicie sin pedidos, esta vista permanecerá vacía.'
              }
            />
          </div>
        )}
        </section>
      </main>

      {acceptOrder ? (
        <div className="dish-dialog-backdrop" role="presentation">
          <section className="dish-dialog dish-dialog--compact" role="dialog" aria-modal="true" aria-labelledby="accept-order-title">
            <header className="dish-dialog__header">
              <div>
                <p>Aceptar pedido</p>
                <h2 id="accept-order-title">{acceptOrder.folio || `#${acceptOrder.id}`}</h2>
              </div>
              <button type="button" onClick={() => setAcceptOrder(null)} aria-label="Cerrar diálogo" disabled={isSubmitting}>
                <X aria-hidden="true" size={20} />
              </button>
            </header>
            <form
              className="dish-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleAccept();
              }}
            >
              <label>
                Tiempo estimado para recoger (minutos)
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  value={acceptMinutes}
                  onChange={(event) => setAcceptMinutes(event.target.value)}
                  disabled={isSubmitting}
                />
              </label>
              <div className="dish-dialog__actions">
                <Button type="button" variant="secondary" onClick={() => setAcceptOrder(null)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Aceptando...' : 'Aceptar pedido'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {rejectOrder ? (
        <div className="dish-dialog-backdrop" role="presentation">
          <section className="dish-dialog dish-dialog--compact" role="dialog" aria-modal="true" aria-labelledby="reject-order-title">
            <header className="dish-dialog__header">
              <div>
                <p>Rechazar pedido</p>
                <h2 id="reject-order-title">{rejectOrder.folio || `#${rejectOrder.id}`}</h2>
              </div>
              <button type="button" onClick={() => setRejectOrder(null)} aria-label="Cerrar diálogo" disabled={isSubmitting}>
                <X aria-hidden="true" size={20} />
              </button>
            </header>
            <form
              className="dish-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleReject();
              }}
            >
              <label>
                Categoría
                <select
                  className="dish-form__select"
                  value={rejectCategory}
                  onChange={(event) => setRejectCategory(event.target.value)}
                  disabled={isSubmitting}
                >
                  {REJECTION_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Motivo
                <textarea
                  className="textarea"
                  rows={3}
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Explica el motivo para conservar el historial"
                  disabled={isSubmitting}
                />
              </label>
              <div className="dish-dialog__actions">
                <Button type="button" variant="secondary" onClick={() => setRejectOrder(null)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" variant="danger" disabled={isSubmitting}>
                  {isSubmitting ? 'Rechazando...' : 'Rechazar pedido'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {confirmOrder ? (
        <div className="dish-dialog-backdrop" role="presentation">
          <section className="dish-dialog dish-dialog--compact" role="dialog" aria-modal="true" aria-labelledby="confirm-order-title">
            <header className="dish-dialog__header">
              <div>
                <p>{confirmAction === 'complete' ? 'Finalizar pedido' : 'Cancelar pedido'}</p>
                <h2 id="confirm-order-title">{confirmOrder.folio || `#${confirmOrder.id}`}</h2>
              </div>
              <button type="button" onClick={() => setConfirmOrder(null)} aria-label="Cerrar diálogo" disabled={isSubmitting}>
                <X aria-hidden="true" size={20} />
              </button>
            </header>
            <div className="dish-dialog-result">
              <p>
                {confirmAction === 'complete'
                  ? 'El pedido se marcará como finalizado y quedará listo para ventas y reportes.'
                  : 'El pedido aceptado se cancelará sin crear una venta nueva.'}
              </p>
              <div className="dish-dialog-result__actions">
                <Button type="button" variant="secondary" onClick={() => setConfirmOrder(null)} disabled={isSubmitting}>
                  Volver
                </Button>
                <Button type="button" onClick={handleConfirm} disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : confirmAction === 'complete' ? 'Finalizar' : 'Cancelar pedido'}
                </Button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <OrderDetailDialog order={detailOrder} loading={detailLoading} error={detailError} onClose={closeDetail} />
    </div>
  );
}
