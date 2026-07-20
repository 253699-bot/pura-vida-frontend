<<<<<<< Updated upstream
=======
import {
  ArrowRight,
  BarChart3,
  Bell,
  ClipboardList,
  FileText,
  Store,
  Utensils,
  WalletCards,
} from 'lucide-react';
>>>>>>> Stashed changes
import { Link } from 'react-router-dom';
import { LogoutButton } from '../../features/auth/logout/LogoutButton.jsx';
import { AdminHeaderActions } from './components/AdminHeaderActions.jsx';
import { useAuth } from '../../shared/hooks/useAuth.js';
<<<<<<< Updated upstream
import { Card } from '../../shared/ui/Card.jsx';
=======
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';

import './AdminHomePage.css';
import './components/AdminPageHeader.css';

const ADMIN_MODULES = [
  {
    icon: BarChart3,
    title: 'Dashboard',
    description: 'Analiza ingresos, pedidos y platillos destacados por diferentes periodos.',
    to: '/admin/dashboard',
    action: 'Ver dashboard',
    tone: 'sage',
  },
  {
    icon: ClipboardList,
    title: 'Pedidos',
    description: 'Consulta y atiende los pedidos registrados por clientes de la plataforma.',
    to: '/admin/orders',
    action: 'Revisar pedidos',
    tone: 'green',
  },
  {
    icon: Utensils,
    title: 'Menú',
    description: 'Administra el catálogo activo y configura los platillos del día.',
    to: '/admin/menu',
    action: 'Administrar menú',
    tone: 'orange',
  },
  {
    icon: WalletCards,
    title: 'Ventas manuales',
    description: 'Registra ventas de mostrador que no provienen de un pedido en línea.',
    to: '/admin/manual-sales',
    action: 'Registrar venta',
    tone: 'orange',
  },
  {
    icon: FileText,
    title: 'Reportes',
    description: 'Consulta el resumen operativo y descarga documentos semanales.',
    to: '/admin/reports',
    action: 'Abrir reportes',
    tone: 'sage',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Revisa avisos de pedidos y actividad reciente de clientes.',
    to: '/admin/notifications',
    action: 'Ver notificaciones',
    tone: 'green',
  },
  {
    icon: Store,
    title: 'Configuración',
    description: 'Actualiza información del negocio, logo y datos de la encargada.',
    to: '/admin/settings',
    action: 'Abrir configuración',
    tone: 'green',
  },
]
>>>>>>> Stashed changes

export function AdminHomePage() {
  const { user } = useAuth();

  return (
<<<<<<< Updated upstream
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">Panel de encargada</h1>
        <p className="page__subtitle">Sesion activa: {user?.nombre || user?.correo}</p>
        <div className="actions">
          <LogoutButton />
=======
    <div className="admin-home-layout">
      <AdminWorkspaceSidebar activePath="/admin" />

      <main className="admin-home-page">
        <header className="admin-home-page__header">
          <div>
            <p>Panel administrativo</p>
            <h1 className="admin-page-header__title">Hola, {displayName}</h1>
            <span>Organiza la operación diaria de PuraVida desde un solo lugar.</span>
          </div>
          <div className="admin-home-page__actions">
            <AdminHeaderActions />
            <LogoutButton />
          </div>
        </header>

        <div className="admin-home-page__content">
          <section className="admin-home-intro">
            <div>
              <span>Centro de control</span>
              <h2>¿Qué deseas administrar?</h2>
              <p>
                Accede a las herramientas operativas, comerciales y de análisis disponibles para
                la encargada.
              </p>
            </div>
            <div className="admin-home-intro__badge" aria-hidden="true">
              <Store size={31} />
            </div>
          </section>

          <section className="admin-home-grid" aria-label="Módulos administrativos">
            {ADMIN_MODULES.map(({ icon: Icon, title, description, to, action, tone }) => (
              <article className="admin-home-card" key={to}>
                <span className={`admin-home-card__icon admin-home-card__icon--${tone}`} aria-hidden="true">
                  <Icon size={25} />
                </span>
                <div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
                <Link to={to}>
                  {action}
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </section>
>>>>>>> Stashed changes
        </div>
      </header>
      <div className="admin-links">
        <Card>
          <div className="stack">
            <div>
              <h2 className="card__title">Gestión del día</h2>
              <p className="card__meta">Controla el estado de la fonda y disponibilidad del menú.</p>
            </div>
            <Link className="button button--primary" to="/admin/gestion-dia">
              Abrir gestión del día
            </Link>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <div>
              <h2 className="card__title">Estado de fonda</h2>
              <p className="card__meta">Abre o cierra el servicio de hoy.</p>
            </div>
            <Link className="button button--primary" to="/admin/status">
              Administrar estado
            </Link>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <div>
              <h2 className="card__title">Menu del dia</h2>
              <p className="card__meta">Configura platillos y disponibilidad.</p>
            </div>
            <Link className="button button--primary" to="/admin/menu">
              Administrar menu
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
