import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../entities/notifications/notificationApi.js';
import { getNotificationTypeDetails } from '../../entities/notifications/notificationModel.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { NOTIFICATIONS_UPDATED_EVENT } from '../../shared/constants/events.js';
import { ClientPageLayout } from '../../shared/layouts/ClientPageLayout.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatDateTime } from '../../shared/utils/date.js';
import './NotificationsPage.css';

export function NotificationsPage() {
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
          setNotifications(
            [...data].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
          );
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiMessage(requestError, 'No se pudieron consultar tus notificaciones.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
    if (notification.leido || pendingId !== null || isMarkingAll) {
      return;
    }

    setPendingId(notification.id);
    setOperationError('');

    try {
      const updatedNotification = await markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === updatedNotification.id ? updatedNotification : item,
        ),
      );
      window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
    } catch (requestError) {
      setOperationError(
        getApiMessage(requestError, 'No se pudo marcar la notificación como leída.'),
      );
    } finally {
      setPendingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (!unreadCount || isMarkingAll || pendingId !== null) {
      return;
    }

    setIsMarkingAll(true);
    setOperationError('');

    try {
      await markAllNotificationsRead();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, leido: true })),
      );
      window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
    } catch (requestError) {
      setOperationError(
        getApiMessage(requestError, 'No se pudieron marcar todas las notificaciones como leídas.'),
      );
    } finally {
      setIsMarkingAll(false);
    }
  }

  return (
    <ClientPageLayout
      className="notifications-page"
      title="Mis notificaciones"
      description={
        unreadCount
          ? `Tienes ${unreadCount} ${unreadCount === 1 ? 'notificación sin leer' : 'notificaciones sin leer'}.`
          : 'Aquí encontrarás las novedades sobre tus pedidos.'
      }
      actions={
        unreadCount ? (
          <button
            type="button"
            className="button button--secondary"
            disabled={isMarkingAll || pendingId !== null}
            onClick={handleMarkAllRead}
          >
            <CheckCheck size={18} aria-hidden="true" />
            {isMarkingAll ? 'Marcando...' : 'Marcar todas como leídas'}
          </button>
        ) : null
      }
    >
      {isLoading ? <Loading label="Cargando notificaciones..." /> : null}
      <ErrorMessage title="No pudimos cargar tus notificaciones" message={error} />
      <ErrorMessage title="No pudimos completar la operación" message={operationError} />

      {!isLoading && !error && !notifications.length ? (
        <section className="notifications-empty">
          <Bell size={42} strokeWidth={1.8} aria-hidden="true" />
          <EmptyState
            title="No tienes notificaciones"
            message="eas respuestas y cambios de estado de tus pedidos aparecerán aquí."
          />
          <Link className="button button--primary" to="/menu">
            Ver menú del día
          </Link>
        </section>
      ) : null}

      {notifications.length ? (
        <section className="notifications-list" aria-label="eistado de notificaciones">
          {notifications.map((notification) => {
            const details = getNotificationTypeDetails(notification.tipo);
            const isPending = pendingId === notification.id;

            return (
              <article
                className={`notification-item ${notification.leido ? '' : 'notification-item--unread'}`.trim()}
                key={notification.id}
              >
                <div className="notification-item__meta">
                  <span className={`notification-type notification-type--${details.tone}`}>
                    {details.label}
                  </span>
                  {!notification.leido ? (
                    <span className="notification-item__unread">Sin leer</span>
                  ) : null}
                  <time dateTime={notification.fecha || undefined}>
                    {formatDateTime(notification.fecha)}
                  </time>
                </div>
                <div className="notification-item__body">
                  <h2>{notification.titulo}</h2>
                  {notification.mensaje ? <p>{notification.mensaje}</p> : null}
                </div>
                <div className="notification-item__actions">
                  {notification.pedidoId ? (
                    <Link to={`/mis-pedidos/${notification.pedidoId}`}>Ver pedido</Link>
                  ) : null}
                  {!notification.leido ? (
                    <button
                      type="button"
                      disabled={pendingId !== null || isMarkingAll}
                      onClick={() => handleMarkRead(notification)}
                    >
                      <Check size={17} aria-hidden="true" />
                      {isPending ? 'Marcando...' : 'Marcar como leída'}
                    </button>
                  ) : (
                    <span className="notification-item__read">
                      <Check size={16} aria-hidden="true" /> Leída
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </ClientPageLayout>
  );
}
