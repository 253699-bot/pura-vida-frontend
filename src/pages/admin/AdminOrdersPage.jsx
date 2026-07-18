import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  ClipboardList,
  Search,
  Settings,
  X,
} from 'lucide-react';
import {
  acceptAdminOrder,
  completeAdminOrder,
  getAdminOrders,
  rejectAdminOrder,
} from '../../entities/orders/orderApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';
import { OrderCard } from './components/OrderCard.jsx';
import './AdminOrdersPage.css';

const ORDER_FILTERS = [
  { value: 'all', label: 'Todos', apiStatus: null },
  { value: 'pending', label: 'Pendientes', apiStatus: 'pendiente' },
  { value: 'accepted', label: 'Aceptados', apiStatus: 'aceptado' },
  { value: 'completed', label: 'Finalizados', apiStatus: 'finalizado' },
  { value: 'rejected', label: 'Rechazados', apiStatus: 'rechazado' },
];

function normalizeStatus(status) {
  const aliases = {
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

  return aliases[String(status || '').toLowerCase()] || status;
}

export function AdminOrdersPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionReasonError, setRejectionReasonError] = useState('');

  const loadOrders = useCallback(async ({ showLoading = true } = {}) => {
    const selectedFilter = ORDER_FILTERS.find((filter) => filter.value === activeFilter);

    if (showLoading) {
      setIsLoading(true);
    }
    setLoadError('');

    try {
      const nextOrders = await getAdminOrders({ estado: selectedFilter?.apiStatus });
      setOrders(nextOrders);
      return true;
    } catch (error) {
      setLoadError(getApiMessage(error, 'No se pudieron cargar los pedidos.'));
      return false;
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [activeFilter]);

  useEffect(() => {
    setActionError('');
    setSuccessMessage('');
    loadOrders();
  }, [loadOrders]);

  const visibleOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('es-MX');

    return orders.filter((order) => {
      const matchesStatus =
        activeFilter === 'all' || normalizeStatus(order.status) === activeFilter;
      const searchableText = [order.customerName, order.id]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('es-MX');
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, orders, searchTerm]);

  async function performAction(order, action, success) {
    setUpdatingOrderId(order.id);
    setActionError('');
    setSuccessMessage('');

    try {
      await action();
      const refreshed = await loadOrders({ showLoading: false });
      setSuccessMessage(
        refreshed
          ? success
          : `${success} No fue posible refrescar el listado automáticamente.`,
      );
      return true;
    } catch (error) {
      setActionError(getApiMessage(error, 'No se pudo actualizar el pedido.'));
      return false;
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleAccept(order) {
    await performAction(
      order,
      () => acceptAdminOrder(order.id),
      `Pedido #${order.id} aceptado correctamente.`,
    );
  }

  function openRejectDialog(order) {
    setRejectOrder(order);
    setRejectionReason('');
    setRejectionReasonError('');
    setActionError('');
  }

  function closeRejectDialog() {
    if (updatingOrderId !== null) {
      return;
    }

    setRejectOrder(null);
    setRejectionReason('');
    setRejectionReasonError('');
  }

  async function handleReject(event) {
    event.preventDefault();
    const normalizedReason = rejectionReason.trim();

    if (!normalizedReason) {
      setRejectionReasonError('El motivo de rechazo es obligatorio.');
      return;
    }

    setRejectionReasonError('');
    const rejected = await performAction(
      rejectOrder,
      () => rejectAdminOrder(rejectOrder.id, normalizedReason),
      `Pedido #${rejectOrder.id} rechazado correctamente.`,
    );

    if (rejected) {
      setRejectOrder(null);
      setRejectionReason('');
    }
  }

  async function handleComplete(order) {
    await performAction(
      order,
      () => completeAdminOrder(order.id),
      `Pedido #${order.id} finalizado correctamente.`,
    );
  }

  return (
    <div className="admin-orders-page">
      <AdminWorkspaceSidebar activePath="/admin/pedidos" />

      <main className="admin-orders-page__main">
        <header className="admin-orders-page__header">
          <div className="admin-orders-page__title">
            <span className="admin-orders-page__heading-icon" aria-hidden="true">
              <ClipboardList size={28} />
            </span>
            <div>
              <p>Operación</p>
              <h1>Gestión de pedidos</h1>
              <span>Consulta y administra los pedidos entrantes de PuraVida.</span>
            </div>
          </div>

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
        </header>

        <div className="admin-orders-page__content">
          <section className="admin-orders-toolbar" aria-label="Herramientas de pedidos">
            <div>
              <span>Vista actual</span>
              <h2>Pedidos registrados</h2>
              <p>Filtra la bandeja por el estado operativo de cada pedido.</p>
            </div>
            <div className="admin-orders-filters" aria-label="Filtrar pedidos por estado">
              {ORDER_FILTERS.map((filter) => (
                <button
                  type="button"
                  className={`admin-orders-filter ${activeFilter === filter.value ? 'admin-orders-filter--active' : ''}`.trim()}
                  aria-pressed={activeFilter === filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  disabled={updatingOrderId !== null}
                  key={filter.value}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </section>

          {isLoading ? <Loading label="Cargando pedidos..." /> : null}
          {!isLoading ? <ErrorMessage title="Pedidos no disponibles" message={loadError} /> : null}
          <ErrorMessage title="No se pudo actualizar el pedido" message={actionError} />
          {successMessage ? (
            <div className="message message--success admin-orders-feedback" role="status">
              {successMessage}
            </div>
          ) : null}

          {!isLoading && loadError ? (
            <div className="admin-orders-retry">
              <Button variant="secondary" onClick={() => loadOrders()}>
                Reintentar
              </Button>
            </div>
          ) : null}

          {!isLoading && !loadError && visibleOrders.length ? (
            <section className="admin-orders-grid" aria-label="Listado de pedidos">
              {visibleOrders.map((order) => (
                <OrderCard
                  order={order}
                  actionsAvailable={updatingOrderId === null}
                  isUpdating={updatingOrderId === order.id}
                  onAccept={handleAccept}
                  onReject={openRejectDialog}
                  onComplete={handleComplete}
                  key={order.id}
                />
              ))}
            </section>
          ) : null}

          {!isLoading && !loadError && !visibleOrders.length ? (
            <section className="admin-orders-empty" aria-label="Estado de pedidos">
              <EmptyState
                title={orders.length ? 'Sin coincidencias' : 'No hay pedidos'}
                message={
                  orders.length
                    ? 'No se encontraron pedidos con la búsqueda actual.'
                    : 'No hay pedidos registrados para el estado seleccionado.'
                }
              />
            </section>
          ) : null}

          <p className="admin-orders-page__notice">
            Los pedidos pendientes pueden aceptarse o rechazarse. Los pedidos aceptados pueden
            finalizarse cuando conservan su venta asociada.
          </p>
        </div>
      </main>

      {rejectOrder ? (
        <div
          className="admin-order-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRejectDialog();
            }
          }}
        >
          <section
            className="admin-order-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-order-title"
          >
            <header className="admin-order-dialog__header">
              <div>
                <p>Pedido #{rejectOrder.id}</p>
                <h2 id="reject-order-title">Rechazar pedido</h2>
              </div>
              <button
                type="button"
                onClick={closeRejectDialog}
                disabled={updatingOrderId !== null}
                aria-label="Cerrar"
              >
                <X size={21} aria-hidden="true" />
              </button>
            </header>

            <ErrorMessage title="No se pudo rechazar el pedido" message={actionError} />

            <form className="admin-order-reject-form" onSubmit={handleReject}>
              <label className="field" htmlFor="rejection-reason">
                <span className="field__label">Motivo de rechazo</span>
                <textarea
                  id="rejection-reason"
                  className="textarea"
                  value={rejectionReason}
                  onChange={(event) => {
                    setRejectionReason(event.target.value);
                    if (rejectionReasonError) setRejectionReasonError('');
                  }}
                  disabled={updatingOrderId !== null}
                  aria-invalid={rejectionReasonError ? 'true' : undefined}
                  aria-describedby={rejectionReasonError ? 'rejection-reason-error' : undefined}
                  autoFocus
                />
                {rejectionReasonError ? (
                  <span className="field__error" id="rejection-reason-error">
                    {rejectionReasonError}
                  </span>
                ) : null}
              </label>

              <div className="admin-order-dialog__actions">
                <Button
                  variant="secondary"
                  onClick={closeRejectDialog}
                  disabled={updatingOrderId !== null}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={updatingOrderId !== null}
                >
                  {updatingOrderId !== null ? 'Rechazando...' : 'Confirmar rechazo'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
