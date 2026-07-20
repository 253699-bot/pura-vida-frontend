import {
  BarChart3,
  Bell,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu as MenuIcon,
  Settings,
  WalletCards,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { BrandLogo } from '../../../shared/ui/BrandLogo.jsx';
import './AdminWorkspaceSidebar.css';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Inicio', to: '/admin', end: true },
  { icon: BarChart3, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: ClipboardList, label: 'Pedidos', to: '/admin/orders' },
  { icon: MenuIcon, label: 'Menú', to: '/admin/menu' },
  { icon: WalletCards, label: 'Ventas manuales', to: '/admin/manual-sales' },
  { icon: FileText, label: 'Reportes', to: '/admin/reports' },
  { icon: Bell, label: 'Notificaciones', to: '/admin/notifications' },
  { icon: Settings, label: 'Configuración', to: '/admin/settings' },
];

function navClassName(baseClass) {
  return ({ isActive }) => `${baseClass} ${isActive ? `${baseClass}--active` : ''}`.trim();
}

export function AdminWorkspaceSidebar() {
  const { user } = useAuth();

  return (
    <aside className="admin-workspace-sidebar" aria-label="Navegación administrativa">
      <NavLink className="admin-workspace-sidebar__brand" to="/admin" end>
        <BrandLogo />
      </NavLink>

      <nav className="admin-workspace-sidebar__nav">
        {NAV_ITEMS.map(({ icon: Icon, label, to, end }) => (
          <NavLink
            key={to}
            end={end}
            className={navClassName('admin-workspace-sidebar__link')}
            to={to}
          >
            <Icon size={21} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink className={navClassName('admin-workspace-sidebar__user')} to="/admin/settings">
        <span className="admin-workspace-sidebar__avatar" aria-hidden="true">
          {(user?.nombre || user?.correo || 'E').charAt(0).toUpperCase()}
        </span>
        <span>
          <strong>{user?.nombre || 'Encargada'}</strong>
          <small>Encargada</small>
        </span>
      </NavLink>
    </aside>
  );
}