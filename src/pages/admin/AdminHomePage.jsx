import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileText,
  ShoppingBag,
  Store,
  Utensils,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LogoutButton } from '../../features/auth/logout/LogoutButton.jsx';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';
import './AdminHomePage.css';

const ADMIN_MODULES = [
  {
    icon: ShoppingBag,
    title: 'Gestión del día',
    description: 'Controla la apertura del negocio y la disponibilidad del menú publicado.',
    to: '/admin/gestion-dia',
    action: 'Gestionar operación',
    tone: 'green',
  },
  {
    icon: Utensils,
    title: 'Menú y platillos',
    description: 'Administra el catálogo activo y configura los platillos del día.',
    to: '/admin/menu',
    action: 'Administrar menú',
    tone: 'orange',
  },
  {
    icon: ClipboardList,
    title: 'Pedidos',
    description: 'Consulta y atiende los pedidos registrados por clientes de la plataforma.',
    to: '/admin/pedidos',
    action: 'Revisar pedidos',
    tone: 'green',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas',
    description: 'Analiza ingresos, pedidos y platillos destacados por diferentes periodos.',
    to: '/admin/statistics',
    action: 'Ver estadísticas',
    tone: 'sage',
  },
  {
    icon: WalletCards,
    title: 'Ventas manuales',
    description: 'Registra ventas de mostrador que no provienen de un pedido en línea.',
    to: '/admin/sales/manual',
    action: 'Registrar venta',
    tone: 'orange',
  },
  {
    icon: FileText,
    title: 'Reporte semanal',
    description: 'Consulta el resumen operativo y descarga el documento oficial de la semana.',
    to: '/admin/reports/weekly',
    action: 'Abrir reporte',
    tone: 'sage',
  },
  {
    icon: Store,
    title: 'Estado del negocio',
    description: 'Revisa o actualiza rápidamente si la fonda se encuentra abierta o cerrada.',
    to: '/admin/status',
    action: 'Administrar estado',
    tone: 'green',
  },
];

export function AdminHomePage() {
  const { user } = useAuth();
  const displayName = user?.nombre || user?.correo || 'Encargada';

  return (
    <div className="admin-home-layout">
      <AdminWorkspaceSidebar activePath="/admin" />

      <main className="admin-home-page">
        <header className="admin-home-page__header">
          <div>
            <p>Panel administrativo</p>
            <h1>Hola, {displayName}</h1>
            <span>Organiza la operación diaria de PuraVida desde un solo lugar.</span>
          </div>
          <LogoutButton />
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
        </div>
      </main>
    </div>
  );
}
