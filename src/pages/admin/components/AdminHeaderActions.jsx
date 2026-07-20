import { Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminHeaderActions({ className = '' }) {
  return (
    <nav className={`admin-header-actions ${className}`.trim()} aria-label="Accesos administrativos">
      <Link to="/admin/notifications" aria-label="Abrir notificaciones" title="Notificaciones">
        <Bell size={21} strokeWidth={2} aria-hidden="true" />
      </Link>
      <Link to="/admin/settings" aria-label="Abrir configuración" title="Configuración">
        <Settings size={21} strokeWidth={2} aria-hidden="true" />
      </Link>
    </nav>
  );
}