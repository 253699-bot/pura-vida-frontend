import { BarChart3, Bell, ClipboardList, FileText, Settings, ShoppingBag, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LogoutButton } from '../../features/auth/logout/LogoutButton.jsx';
import { AdminHeaderActions } from './components/AdminHeaderActions.jsx';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';
import './AdminHomePage.css';
import './components/AdminPageHeader.css';

const ADMIN_MODULES = [
  {
    title: 'Dashboard',
    description: 'Consulta indicadores clave, ventas y rendimiento del día.',
    href: '/admin/dashboard',
    icon: BarChart3,
    cta: 'Ver estadísticas'
  },
  {
    title: 'Pedidos',
    description: 'Gestiona pedidos entrantes, tiempos de espera y entregas.',
    href: '/admin/orders',
    icon: ClipboardList,
    cta: 'Abrir pedidos'
  },
  {
    title: 'Menú del día',
    description: 'Controla platillos, disponibilidad y el estado de la fonda.',
    href: '/admin/menu',
    icon: Utensils,
    cta: 'Administrar menú'
  },
  {
    title: 'Ventas manuales',
    description: 'Registra ventas realizadas directamente en la fonda.',
    href: '/admin/manual-sales',
    icon: ShoppingBag,
    cta: 'Registrar venta'
  },
  {
    title: 'Reportes semanales',
    description: 'Genera reportes históricos y descarga comprobantes PDF.',
    href: '/admin/reports',
    icon: FileText,
    cta: 'Ver reportes'
  },
  {
    title: 'Notificaciones',
    description: 'Revisa avisos operativos y mensajes del sistema.',
    href: '/admin/notifications',
    icon: Bell,
    cta: 'Abrir bandeja'
  },
  {
    title: 'Configuración',
    description: 'Actualiza la información pública y el logo del negocio.',
    href: '/admin/settings',
    icon: Settings,
    cta: 'Editar perfil'
  }
];

export function AdminHomePage() {
  const { user } = useAuth();
  const displayName = user?.nombre || user?.correo || 'Encargada PuraVida';

  return (
    <div className="admin-home-layout">
      <AdminWorkspaceSidebar activePath="/admin" />
      <main className="admin-home-page">
        <header className="admin-home-page__header">
          <div>
            <p className="admin-page-header__eyebrow">Inicio administrativo</p>
            <h1 className="admin-page-header__title">Hola, {displayName}</h1>
            <span className="admin-page-header__subtitle">
              Centraliza la operación diaria de PuraVida desde este panel.
            </span>
          </div>
          <div className="admin-home-page__actions">
            <LogoutButton />
            <AdminHeaderActions />
          </div>
        </header>

        <section className="admin-home-page__content" aria-label="Módulos administrativos">
          <div className="admin-home-grid">
            {ADMIN_MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <Link className="admin-home-card" to={module.href} key={module.href}>
                  <span className="admin-home-card__icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <div>
                    <h2>{module.title}</h2>
                    <p>{module.description}</p>
                  </div>
                  <span className="admin-home-card__cta">{module.cta}</span>
                </Link>
              );
            })}
          </div>

          <footer className="admin-home-session">
            <span>Sesión activa como encargada.</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
