import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogoutButton } from '../features/auth/logout/LogoutButton.jsx';
import { LandingHeader } from '../pages/landing/LandingPage.jsx';
import brandLogo from '../shared/assets/brand/pura-vida-logo.svg';
import { useAuth } from '../shared/hooks/useAuth.js';
import { AppRouter } from './router.jsx';

function getNavLinkClassName({ isActive }) {
  return `nav__link ${isActive ? 'nav__link--active' : ''}`.trim();
}

function AdminShellHeader() {
  const { isAuthenticated, isEncargada } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <NavLink to="/" className="brand" aria-label="PuraVida inicio">
          <img className="brand__logo" src={brandLogo} alt="PuraVida" />
        </NavLink>
        <nav className="nav" aria-label="Principal">
          <NavLink to="/" className={getNavLinkClassName}>
            Inicio
          </NavLink>
          <NavLink to="/menu" className={getNavLinkClassName}>
            Menú del día
          </NavLink>
          <Link to="/#ubicacion" className="nav__link">
            Ubicación
          </Link>
          <Link to="/#nosotros" className="nav__link">
            Nosotros
          </Link>
          {isEncargada ? (
            <NavLink to="/admin" className={getNavLinkClassName}>
              Panel
            </NavLink>
          ) : null}
          {isAuthenticated ? (
            <LogoutButton size="sm" />
          ) : (
            <NavLink to="/login" className="topbar__login">
              Iniciar sesión
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const hasStandaloneAdminHeader = [
    '/admin',
    '/admin/gestion-dia',
    '/admin/menu',
    '/admin/pedidos',
    '/admin/pedidos/history',
    '/admin/status',
    '/admin/statistics',
    '/admin/sales/manual',
    '/admin/reports/weekly',
    '/admin/notificaciones',
    '/admin/configuracion',
  ].includes(location.pathname);

  return (
    <div className="app-shell">
      {isAdminRoute && !hasStandaloneAdminHeader ? <AdminShellHeader /> : null}
      {!isAdminRoute && location.pathname !== '/' ? <LandingHeader /> : null}
      <AppRouter />
    </div>
  );
}
