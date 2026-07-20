import { Bell, Check, CheckCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../entities/notifications/notificationApi.js';
import { getNotificationTypeDetails } from '../../entities/notifications/notificationModel.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { NOTIFICATIONS_UPDATED_EVENT } from '../../shared/constants/events.js';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatDateTime } from '../../shared/utils/date.js';
import { AdminHeaderActions } from './components/AdminHeaderActions.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';
import '../notifications/NotificationsPage.css';
import './AdminNotificationsPage.css';
import './components/AdminPageHeader.css';

export function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [operationError, setOperationError] = useState('');
  const [pendingId, setPendingId] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        const data = await getMyNotifications();
        if (isMounted) {
          setNotifications([...data].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
        }
      } catch (requestError) {
        if (isMounted) setError(getApiMessage(requestError, 'No se pudieron consultar las notificaciones.'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.leido).length,
    [notifications],
  );

  async function handleMarkRead(notification) {
    if (notification.leido || pendingId !== null || isMarkingAll) return;

    setPendingId(notification.id);
    setOperationError('');

    try {
      const updatedNotification = await markNotificationRead(notification.id);
      setNotifications((current) => current.map((item) => (item.id === updatedNotification.id ? updatedNotification : item)));
      window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
    } catch (requestError) {
      setOperationError(getApiMessage(requestError, 'No se pudo marcar la notificación como leída.'));
    } finally {
      setPendingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (!unreadCount || isMarkingAll || pendingId !== null) return;

    setIsMarkingAll(true);
    setOperationError('');

    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, leido: true })));
      window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
    } catch (requestError) {
      setOperationError(getApiMessage(requestError, 'No se pudieron marcar todas como leídas.'));
    } finally {
      setIsMarkingAll(false);
    }
  }

  return (
    <div className="admin-notifications-layout">
      <AdminWorkspaceSidebar activePath="/admin/notificaciones" />

      <main className="admin-notifications-page">
        <header className="admin-notifications-header">
          <div>
            <p>Notificaciones</p>
            <h1 className="admin-page-header__title">Bandeja de encargada</h1>
            <span>{unreadCount ? `${unreadCount} sin leer` : 'No hay pendientes por leer'}</span>
          </div>
          <div className="admin-notifications-header__actions">
            {unreadCount ? (
              <Button variant="secondary" disabled={isMarkingAll || pendingId !== null} onClick={handleMarkAllRead}>
                <CheckCheck size={18} aria-hidden="true" />
                {isMarkingAll ? 'Marcando...' : 'Marcar todas'}
              </Button>
            ) : null}
            <AdminHeaderActions />
          </div>
        </header>

        <div className="admin-notifications-content">
          {isLoading ? <Loading label="Cargando notificaciones..." /> : null}
        <ErrorMessage message={error} />
        <ErrorMessage message={operationError} />

        {!isLoading && !error && !notifications.length ? (
          <section className="notifications-empty">
            <Bell size={42} strokeWidth={1.8} aria-hidden="true" />
            <EmptyState title="Sin notificaciones" message="Los pedidos nuevos aparecerán en esta bandeja." />
          </section>
        ) : null}

        {notifications.length ? (
          <section className="notifications-list" aria-label="Listado de notificaciones">
            {notifications.map((notification) => {
              const details = getNotificationTypeDetails(notification.tipo);
              const isPending = pendingId === notification.id;

              return (
                <article className={`notification-item ${notification.leido ? '' : 'notification-item--unread'}`.trim()} key={notification.id}>
                  <div className="notification-item__meta">
                    <span className={`notification-type notification-type--${details.tone}`}>{details.label}</span>
                    {!notification.leido ? <span className="notification-item__unread">Sin leer</span> : null}
                    <time dateTime={notification.fecha || undefined}>{formatDateTime(notification.fecha)}</time>
                  </div>
                  <div className="notification-item__body">
                    <h2>{notification.titulo}</h2>
                    {notification.mensaje ? <p>{notification.mensaje}</p> : null}
                  </div>
                  <div className="notification-item__actions">
                    {notification.pedidoId ? <Link to={`/admin/pedidos?orderId=${notification.pedidoId}`}>Ver pedido</Link> : null}
                    {!notification.leido ? (
                      <button type="button" disabled={pendingId !== null || isMarkingAll} onClick={() => handleMarkRead(notification)}>
                        <Check size={17} aria-hidden="true" />
                        {isPending ? 'Marcando...' : 'Marcar leída'}
                      </button>
                    ) : (
                      <span className="notification-item__read"><Check size={16} aria-hidden="true" /> Leída</span>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}
        </div>
      </main>
    </div>
  );
}
