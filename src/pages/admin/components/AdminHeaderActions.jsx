import { Bell, Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyNotifications } from '../../../entities/notifications/notificationApi.js';
import { NOTIFICATIONS_UPDATED_EVENT } from '../../../shared/constants/events.js';

export function AdminHeaderActions({ className = '' }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function refreshUnreadCount() {
      try {
        const notifications = await getMyNotifications();
        if (isMounted) {
          setUnreadCount(notifications.filter((notification) => !notification.leido).length);
        }
      } catch {
        if (isMounted) {
          setUnreadCount(0);
        }
      }
    }

    refreshUnreadCount();

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshUnreadCount);
    window.addEventListener('focus', refreshUnreadCount);

    return () => {
      isMounted = false;
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshUnreadCount);
      window.removeEventListener('focus', refreshUnreadCount);
    };
  }, []);

  const unreadLabel = useMemo(() => (unreadCount > 99 ? '99+' : String(unreadCount)), [unreadCount]);
  const hasUnread = unreadCount > 0;

  return (
    <nav className={`admin-header-actions ${className}`.trim()} aria-label="Accesos administrativos">
      <Link
        to="/admin/notifications"
        className={hasUnread ? 'admin-header-actions__link admin-header-actions__link--unread' : 'admin-header-actions__link'}
        aria-label={hasUnread ? `Abrir notificaciones, ${unreadLabel} sin leer` : 'Abrir notificaciones'}
        title="Notificaciones"
      >
        <Bell size={21} strokeWidth={2} aria-hidden="true" />
        {hasUnread ? <span className="admin-header-actions__badge" aria-hidden="true">{unreadLabel}</span> : null}
      </Link>
      <Link to="/admin/settings" className="admin-header-actions__link" aria-label="Abrir configuración" title="Configuración">
        <Settings size={21} strokeWidth={2} aria-hidden="true" />
      </Link>
    </nav>
  );
}
