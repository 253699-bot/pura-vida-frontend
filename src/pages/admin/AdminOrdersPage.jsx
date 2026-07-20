<<<<<<< Updated upstream
import { useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  House,
  Search,
  Settings,
  ShoppingCart,
  Utensils,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import brandLogo from '../../shared/assets/brand/pura-vida-logo.svg';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
=======
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  acceptAdminOrder,
  cancelAdminOrder,
  completeAdminOrder,
  getAdminOrder,
  getAdminOrders,
  rejectAdminOrder,
} from '../../entities/orders/orderApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import { AdminHeaderActions } from './components/AdminHeaderActions.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';
>>>>>>> Stashed changes
import { OrderCard } from './components/OrderCard.jsx';

<<<<<<< Updated upstream
const SIDE_NAVIGATION = [
  { icon: House, label: 'Dashboard', to: '/admin' },
  { icon: ShoppingCart, label: 'Órdenes', to: '/admin/pedidos', active: true },
  { icon: Utensils, label: 'Menú Diario', to: '/admin/gestion-dia' },
  { icon: BarChart3, label: 'Reportes', disabled: true },
  { icon: Wallet, label: 'Ventas', disabled: true },
];

const ORDER_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'accepted', label: 'Aceptados' },
  { value: 'rejected', label: 'Rechazados' },
];

// No existe un endpoint de pedidos en el frontend. La colección permanece vacía
// para evitar presentar pedidos ficticios como datos reales de la fonda.
const ORDERS = [];

function normalizeStatus(status) {
  const aliases = {
    pendiente: 'pending',
    pending: 'pending',
    aceptado: 'accepted',
    accepted: 'accepted',
    rechazado: 'rejected',
    rejected: 'rejected',
  };
=======
import './AdminOrdersPage.css';
import './components/AdminPageHeader.css';

const CURRENT_ORDER_FILTERS = [
  { value: 'all', label: 'Todos', apiStatus: null },
  { value: 'pending', label: 'Pendientes', apiStatus: 'pendiente' },
  { value: 'accepted', label: 'Aceptados', apiStatus: 'aceptado' },
  { value: 'completed', label: 'Finalizados', apiStatus: 'finalizado' },
  { value: 'rejected', label: 'Rechazados', apiStatus: 'rechazado' },
  { value: 'cancelled', label: 'Cancelados', apiStatus: 'cancelado' },
];

const HISTORY_ORDER_FILTERS = [
  { value: 'all', label: 'Todos', apiStatus: null },
  { value: 'completed', label: 'Finalizados', apiStatus: 'finalizado' },
  { value: 'rejected', label: 'Rechazados', apiStatus: 'rechazado' },
  { value: 'cancelled', label: 'Cancelados', apiStatus: 'cancelado' },
];
>>>>>>> Stashed changes

const STATUS_ALIASES = {
  pendiente: 'pending',
  pending: 'pending',
  aceptado: 'accepted',
  accepted: 'accepted',
  finalizado: 'completed',
  completed: 'completed',
  rechazado: 'rejected',
  rejected: 'rejected',
  cancelado: 'cancelled',
  cancelled: 'cancelled',
};

function normalizeStatus(status) {
  return STATUS_ALIASES[String(status || '').toLowerCase()] || status;
}

<<<<<<< Updated upstream
export function AdminOrdersPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
=======
function OrderDetailDialog({ order, isLoading, error, onClose }) {
  return (
    <div className="admin-order-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="admin-order-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-order-detail-title">
        <header className="admin-order-dialog__header">
          <div>
            <p>{order?.id ? `Pedido #${order.id}` : 'Pedido'}</p>
            <h2 id="admin-order-detail-title">Detalle del pedido</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={21} aria-hidden="true" /></button>
        </header>
        {isLoading ? <Loading label="Cargando detalle..." /> : null}
        <ErrorMessage message={error} />
        {!isLoading && !error && order ? (
          <div className="admin-order-detail">
            <dl>
              <div><dt>Cliente</dt><dd>{order.customerName || 'Cliente'}</dd></div>
              <div><dt>Estado</dt><dd>{order.status}</dd></div>
              <div><dt>Total</dt><dd>{formatCurrency(order.total)}</dd></div>
              {order.estimatedWait ? <div><dt>Espera</dt><dd>{order.estimatedWait}</dd></div> : null}
              {order.rejectionReason ? <div><dt>Rechazo</dt><dd>{order.rejectionReason}</dd></div> : null}
              {order.cancelledAt ? <div><dt>Cancelado</dt><dd>{order.cancelledAt}</dd></div> : null}
            </dl>
            <div className="admin-order-detail__items">
              {order.items?.map((item) => (
                <div key={item.id || item.menuItemId}>
                  <span>{item.quantity}x {item.name}</span>
                  <strong>{formatCurrency(item.subtotal)}</strong>
                </div>
              ))}
              {!order.items?.length ? <p>Sin partidas disponibles.</p> : null}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export function AdminOrdersPage({ history = false }) {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [acceptOrder, setAcceptOrder] = useState(null);
  const [estimatedWait, setEstimatedWait] = useState('');
  const [estimatedWaitError, setEstimatedWaitError] = useState('');
  const [rejectOrder, setRejectOrder] = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionReasonError, setRejectionReasonError] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [openedQueryOrderId, setOpenedQueryOrderId] = useState(null);

  const filters = history ? HISTORY_ORDER_FILTERS : CURRENT_ORDER_FILTERS;

  useEffect(() => {
    if (!filters.some((filter) => filter.value === activeFilter)) {
      setActiveFilter('all');
    }
  }, [activeFilter, filters]);

  const loadOrders = useCallback(async ({ showLoading = true } = {}) => {
    const selectedFilter = filters.find((filter) => filter.value === activeFilter);
    if (showLoading) setIsLoading(true);
    setLoadError('');

    try {
      const nextOrders = await getAdminOrders({
        estado: selectedFilter?.apiStatus,
        currentCycleOnly: !history,
        historyOnly: history,
      });
      setOrders(nextOrders);
      return true;
    } catch (error) {
      setLoadError(getApiMessage(error, 'No se pudieron cargar los pedidos.'));
      return false;
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [activeFilter, filters, history]);

  useEffect(() => {
    setActionError('');
    setSuccessMessage('');
    loadOrders();
  }, [loadOrders]);
>>>>>>> Stashed changes

  const openDetail = useCallback(async (order) => {
    setDetailOrder(order);
    setIsLoadingDetail(true);
    setDetailError('');

    try {
      const detail = await getAdminOrder(order.id);
      setDetailOrder(detail);
    } catch (error) {
      setDetailError(getApiMessage(error, 'No se pudo cargar el detalle.'));
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    const queryOrderId = searchParams.get('orderId');
    if (!queryOrderId || isLoading || loadError || openedQueryOrderId === queryOrderId) return;

    const matchingOrder = orders.find((order) => String(order.id) === String(queryOrderId));
    if (matchingOrder) {
      setOpenedQueryOrderId(queryOrderId);
      openDetail(matchingOrder);
    }
  }, [isLoading, loadError, openedQueryOrderId, openDetail, orders, searchParams]);

  const visibleOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('es-MX');

<<<<<<< Updated upstream
    return ORDERS.filter((order) => {
      const matchesStatus =
        activeFilter === 'all' || normalizeStatus(order.status) === activeFilter;
      const searchableText = [order.customerName, order.id]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('es-MX');
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
=======
    return orders.filter((order) => {
      const matchesStatus = activeFilter === 'all' || normalizeStatus(order.status) === activeFilter;
      const searchableText = [order.customerName, order.id].filter(Boolean).join(' ').toLocaleLowerCase('es-MX');
      return matchesStatus && (!normalizedSearch || searchableText.includes(normalizedSearch));
>>>>>>> Stashed changes
    });
  }, [activeFilter, searchTerm]);

<<<<<<< Updated upstream
  const userName = user?.nombre || user?.correo || 'Encargada';
=======
  async function performAction(order, action, success) {
    setUpdatingOrderId(order.id);
    setActionError('');
    setSuccessMessage('');

    try {
      await action();
      const refreshed = await loadOrders({ showLoading: false });
      setSuccessMessage(refreshed ? success : `${success} No fue posible refrescar el listado automáticamente.`);
      return true;
    } catch (error) {
      setActionError(getApiMessage(error, 'No se pudo actualizar el pedido.'));
      return false;
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function openAcceptDialog(order) {
    setAcceptOrder(order);
    setEstimatedWait(order.estimatedWait || '');
    setEstimatedWaitError('');
    setActionError('');
  }

  async function handleAccept(event) {
    event.preventDefault();
    const wait = estimatedWait.trim();

    if (!wait) {
      setEstimatedWaitError('El tiempo estimado es obligatorio.');
      return;
    }

    const accepted = await performAction(acceptOrder, () => acceptAdminOrder(acceptOrder.id, wait), `Pedido #${acceptOrder.id} aceptado.`);
    if (accepted) setAcceptOrder(null);
  }

  function openRejectDialog(order) {
    setRejectOrder(order);
    setRejectionReason('');
    setRejectionReasonError('');
    setActionError('');
  }

  async function handleReject(event) {
    event.preventDefault();
    const normalizedReason = rejectionReason.trim();

    if (!normalizedReason) {
      setRejectionReasonError('El motivo de rechazo es obligatorio.');
      return;
    }

    const rejected = await performAction(rejectOrder, () => rejectAdminOrder(rejectOrder.id, normalizedReason), `Pedido #${rejectOrder.id} rechazado.`);
    if (rejected) setRejectOrder(null);
  }

  async function handleComplete(order) {
    await performAction(order, () => completeAdminOrder(order.id), `Pedido #${order.id} finalizado.`);
  }
>>>>>>> Stashed changes

  function handleCancel(order) {
    setCancelOrder(order);
    setActionError('');
    setSuccessMessage('');
  }

  async function handleConfirmCancel() {
    if (!cancelOrder) return;
    const cancelled = await performAction(cancelOrder, () => cancelAdminOrder(cancelOrder.id), `Pedido #${cancelOrder.id} cancelado.`);
    if (cancelled) setCancelOrder(null);
  }

  const headerCopy = history
    ? {
      eyebrow: 'Historial',
      title: 'Historial de pedidos',
      description: 'Consulta pedidos finalizados, rechazados y cancelados de todas las jornadas.',
      toolbarEyebrow: 'Historial',
      toolbarTitle: 'Pedidos históricos',
      toolbarDescription: 'Filtra el historial por estados cerrados.',
      emptyTitle: orders.length ? 'Sin coincidencias' : 'No hay historial',
      emptyMessage: orders.length ? 'No se encontraron pedidos con la búsqueda actual.' : 'No hay pedidos finalizados, rechazados o cancelados para mostrar.',
    }
    : {
      eyebrow: 'Operación',
      title: 'Gestión de pedidos',
      description: 'Consulta, acepta, rechaza, cancela o finaliza pedidos de la jornada abierta actual.',
      toolbarEyebrow: 'Vista actual',
      toolbarTitle: 'Pedidos actuales',
      toolbarDescription: 'Solo se muestran pedidos desde la apertura vigente de la fonda.',
      emptyTitle: orders.length ? 'Sin coincidencias' : 'No hay pedidos actuales',
      emptyMessage: orders.length ? 'No se encontraron pedidos con la búsqueda actual.' : 'No hay pedidos para la jornada abierta actual o la fonda está cerrada.',
    };

  return (
    <div className="admin-orders-page">
<<<<<<< Updated upstream
      <aside className="orders-sidebar" aria-label="Navegación administrativa">
        <Link className="orders-sidebar__brand" to="/" aria-label="PuraVida inicio">
          <img src={brandLogo} alt="PuraVida" />
        </Link>

        <nav className="orders-sidebar__nav">
          {SIDE_NAVIGATION.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <button
                  type="button"
                  className="orders-sidebar__item orders-sidebar__item--disabled"
                  disabled
                  title="Próximamente"
                  key={item.label}
                >
                  <Icon size={21} strokeWidth={2} aria-hidden="true" />
                  {item.label}
                </button>
              );
            }

            return (
              <Link
                className={`orders-sidebar__item ${item.active ? 'orders-sidebar__item--active' : ''}`.trim()}
                to={item.to}
                key={item.label}
              >
                <Icon size={21} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="orders-sidebar__user">
          <span className="orders-sidebar__avatar" aria-hidden="true">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <span>
            <strong>{userName}</strong>
            <small>Encargada</small>
          </span>
        </div>
      </aside>

      <main className="admin-orders-page__main">
        <div className="admin-orders-page__topbar">
          <label className="admin-orders-search">
            <Search size={19} strokeWidth={2} aria-hidden="true" />
            <span className="admin-orders-search__label">Buscar pedidos</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar pedidos..."
            />
          </label>
          <button type="button" className="admin-orders-utility" disabled title="Próximamente">
            <Bell size={21} strokeWidth={2} aria-hidden="true" />
            <span className="admin-orders-utility__label">Notificaciones</span>
          </button>
          <button type="button" className="admin-orders-utility" disabled title="Próximamente">
            <Settings size={21} strokeWidth={2} aria-hidden="true" />
            <span className="admin-orders-utility__label">Configuración</span>
          </button>
        </div>

        <header className="admin-orders-page__header">
          <h1>Gestión de pedidos</h1>
          <p>Gestiona los pedidos entrantes de tu fonda.</p>
        </header>

        <div className="admin-orders-filters" aria-label="Filtrar pedidos por estado">
          {ORDER_FILTERS.map((filter) => (
            <button
              type="button"
              className={`admin-orders-filter ${activeFilter === filter.value ? 'admin-orders-filter--active' : ''}`.trim()}
              aria-pressed={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
              key={filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {visibleOrders.length ? (
          <section className="admin-orders-grid" aria-label="Listado de pedidos">
            {visibleOrders.map((order) => (
              <OrderCard order={order} actionsAvailable={false} key={order.id} />
            ))}
          </section>
        ) : (
          <section className="admin-orders-empty" aria-label="Estado de pedidos">
            <EmptyState
              title="Consulta de pedidos pendiente"
              message="La interfaz está lista, pero el frontend aún no tiene un endpoint definido para consultar pedidos reales."
            />
          </section>
        )}

        <p className="admin-orders-page__notice">
          Aceptar, rechazar, definir el tiempo estimado y capturar el motivo de rechazo se
          habilitarán cuando existan endpoints de pedidos en el frontend.
        </p>
      </main>
=======
      <AdminWorkspaceSidebar activePath="/admin/orders" />

      <main className="admin-orders-page__main">
        <header className="admin-orders-page__header">
          <div className="admin-orders-page__title">
            <div>
              <p>{headerCopy.eyebrow}</p>
              <h1 className={history ? undefined : 'admin-page-header__title'}>{headerCopy.title}</h1>
              <span>{headerCopy.description}</span>
            </div>
          </div>

          <div className="admin-orders-page__topbar">
            <label className="admin-orders-search">
              <Search size={19} strokeWidth={2} aria-hidden="true" />
              <span className="admin-orders-search__label">Buscar pedidos</span>
              <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar pedidos..." />
            </label>
            <AdminHeaderActions />
          </div>
        </header>

        <div className="admin-orders-page__content">
          <section className="admin-orders-toolbar" aria-label="Herramientas de pedidos">
            <div>
              <span>{headerCopy.toolbarEyebrow}</span>
              <h2>{headerCopy.toolbarTitle}</h2>
              <p>{headerCopy.toolbarDescription}</p>
            </div>
            <div className="admin-orders-toolbar__actions">
              <Link className="button button--secondary button--md admin-orders-history-link" to={history ? '/admin/orders' : '/admin/orders/history'}>
                {history ? 'Pedidos actuales' : 'Historial de pedidos'}
              </Link>
              <div className="admin-orders-filters" aria-label="Filtrar pedidos por estado">
                {filters.map((filter) => (
                  <button type="button" className={`admin-orders-filter ${activeFilter === filter.value ? 'admin-orders-filter--active' : ''}`.trim()} aria-pressed={activeFilter === filter.value} onClick={() => setActiveFilter(filter.value)} disabled={updatingOrderId !== null} key={filter.value}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {isLoading ? <Loading label="Cargando pedidos..." /> : null}
          {!isLoading ? <ErrorMessage title="Pedidos no disponibles" message={loadError} /> : null}
          <ErrorMessage title="No se pudo actualizar el pedido" message={actionError} />
          {successMessage ? <div className="message message--success admin-orders-feedback" role="status">{successMessage}</div> : null}

          {!isLoading && loadError ? <div className="admin-orders-retry"><Button variant="secondary" onClick={() => loadOrders()}>Reintentar</Button></div> : null}

          {!isLoading && !loadError && visibleOrders.length ? (
            <section className="admin-orders-grid" aria-label="Listado de pedidos">
              {visibleOrders.map((order) => (
                <OrderCard
                  order={order}
                  actionsAvailable={updatingOrderId === null}
                  isUpdating={updatingOrderId === order.id}
                  onAccept={openAcceptDialog}
                  onReject={openRejectDialog}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                  onView={openDetail}
                  key={order.id}
                />
              ))}
            </section>
          ) : null}

          {!isLoading && !loadError && !visibleOrders.length ? (
            <section className="admin-orders-empty" aria-label="Estado de pedidos">
              <EmptyState title={headerCopy.emptyTitle} message={headerCopy.emptyMessage} />
            </section>
          ) : null}
        </div>
      </main>

      {acceptOrder ? (
        <div className="admin-order-dialog-backdrop" role="presentation">
          <section className="admin-order-dialog" role="dialog" aria-modal="true" aria-labelledby="accept-order-title">
            <header className="admin-order-dialog__header">
              <div><p>Pedido #{acceptOrder.id}</p><h2 id="accept-order-title">Aceptar pedido</h2></div>
              <button type="button" onClick={() => setAcceptOrder(null)} disabled={updatingOrderId !== null} aria-label="Cerrar"><X size={21} aria-hidden="true" /></button>
            </header>
            <form className="admin-order-reject-form" onSubmit={handleAccept}>
              <label className="field" htmlFor="estimated-wait">
                <span className="field__label">Tiempo estimado de espera</span>
                <input id="estimated-wait" className="input" value={estimatedWait} maxLength={100} onChange={(event) => { setEstimatedWait(event.target.value); setEstimatedWaitError(''); }} disabled={updatingOrderId !== null} autoFocus />
                {estimatedWaitError ? <span className="field__error">{estimatedWaitError}</span> : null}
              </label>
              <div className="admin-order-dialog__actions">
                <Button variant="secondary" onClick={() => setAcceptOrder(null)} disabled={updatingOrderId !== null}>Cancelar</Button>
                <Button type="submit" disabled={updatingOrderId !== null}>{updatingOrderId !== null ? 'Aceptando...' : 'Confirmar aceptación'}</Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {rejectOrder ? (
        <div className="admin-order-dialog-backdrop" role="presentation">
          <section className="admin-order-dialog" role="dialog" aria-modal="true" aria-labelledby="reject-order-title">
            <header className="admin-order-dialog__header">
              <div><p>Pedido #{rejectOrder.id}</p><h2 id="reject-order-title">Rechazar pedido</h2></div>
              <button type="button" onClick={() => setRejectOrder(null)} disabled={updatingOrderId !== null} aria-label="Cerrar"><X size={21} aria-hidden="true" /></button>
            </header>
            <form className="admin-order-reject-form" onSubmit={handleReject}>
              <label className="field" htmlFor="rejection-reason">
                <span className="field__label">Motivo de rechazo</span>
                <textarea id="rejection-reason" className="textarea" value={rejectionReason} onChange={(event) => { setRejectionReason(event.target.value); setRejectionReasonError(''); }} disabled={updatingOrderId !== null} autoFocus />
                {rejectionReasonError ? <span className="field__error">{rejectionReasonError}</span> : null}
              </label>
              <div className="admin-order-dialog__actions">
                <Button variant="secondary" onClick={() => setRejectOrder(null)} disabled={updatingOrderId !== null}>Cancelar</Button>
                <Button type="submit" variant="danger" disabled={updatingOrderId !== null}>{updatingOrderId !== null ? 'Rechazando...' : 'Confirmar rechazo'}</Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {cancelOrder ? (
        <div className="admin-order-dialog-backdrop" role="presentation">
          <section className="admin-order-dialog" role="dialog" aria-modal="true" aria-labelledby="cancel-order-title">
            <header className="admin-order-dialog__header">
              <div><p>Pedido #{cancelOrder.id}</p><h2 id="cancel-order-title">Cancelar pedido</h2></div>
              <button type="button" onClick={() => setCancelOrder(null)} disabled={updatingOrderId !== null} aria-label="Cerrar"><X size={21} aria-hidden="true" /></button>
            </header>
            <div className="admin-order-cancel-confirmation">
              <p>El pedido cambiará a cancelado y el cliente recibirá una notificación para revisar el detalle.</p>
              <div className="admin-order-dialog__actions">
                <Button variant="secondary" onClick={() => setCancelOrder(null)} disabled={updatingOrderId !== null}>Volver</Button>
                <Button variant="danger" onClick={handleConfirmCancel} disabled={updatingOrderId !== null}>
                  {updatingOrderId !== null ? 'Cancelando...' : 'Cancelar pedido'}
                </Button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {detailOrder ? <OrderDetailDialog order={detailOrder} isLoading={isLoadingDetail} error={detailError} onClose={() => setDetailOrder(null)} /> : null}
>>>>>>> Stashed changes
    </div>
  );
}
