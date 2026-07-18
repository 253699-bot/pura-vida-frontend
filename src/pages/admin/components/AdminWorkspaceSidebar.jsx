import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Menu as MenuIcon,
  ShoppingBag,
  WalletCards,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import brandLogo from '../../../shared/assets/brand/pura-vida-logo.svg';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import './AdminWorkspaceSidebar.css';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
  { icon: ShoppingBag, label: 'Gestión del día', to: '/admin/gestion-dia' },
  { icon: MenuIcon, label: 'Menú', to: '/admin/menu' },
  { icon: BarChart3, label: 'Estadísticas', to: '/admin/statistics' },
  { icon: FileText, label: 'Reporte semanal', to: '/admin/reports/weekly' },
  { icon: WalletCards, label: 'Ventas manuales', to: '/admin/sales/manual' },
];

export function AdminWorkspaceSidebar({ activePath }) {
  const { user } = useAuth();

  return (
    <aside className="admin-workspace-sidebar" aria-label="Navegación administrativa">
      <NavLink className="admin-workspace-sidebar__brand" to="/admin">
        <img src={brandLogo} alt="PuraVida" />
      </NavLink>

      <nav className="admin-workspace-sidebar__nav">
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            className={`admin-workspace-sidebar__link ${activePath === to ? 'admin-workspace-sidebar__link--active' : ''}`}
            to={to}
          >
            <Icon size={21} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-workspace-sidebar__user">
        <span className="admin-workspace-sidebar__avatar" aria-hidden="true">
          {(user?.nombre || user?.correo || 'E').charAt(0).toUpperCase()}
        </span>
        <span>
          <strong>{user?.nombre || 'Encargada'}</strong>
          <small>Encargada</small>
        </span>
      </div>
    </aside>
  );
}
