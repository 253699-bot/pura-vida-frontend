import { useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  House,
  Search,
  Settings,
  ShoppingCart,
  Utensils,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import brandLogo from '../../shared/assets/brand/pura-vida-logo.svg';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { OrderCard } from './components/OrderCard.jsx';
import './AdminOrdersPage.css';

const SIDE_NAVIGATION = [
  { icon: House, label: 'Dashboard', to: '/admin' },
  { icon: ShoppingCart, label: 'Órdenes', to: '/admin/pedidos', active: true },
  { icon: Utensils, label: 'Menú Diario', to: '/admin/gestion-dia' },
  { icon: BarChart3, label: 'Reportes', disabled: true },
  { icon: Wallet, label: 'Ventas', disabled: true },
];

const ORDER_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'accepted', label: 'Aceptados' },
  { value: 'rejected', label: 'Rechazados' },
];

// No existe un endpoint de pedidos en el frontend. La colección permanece vacía
// para evitar presentar pedidos ficticios como datos reales de la fonda.
const ORDERS = [];

function normalizeStatus(status) {
  const aliases = {
    pendiente: 'pending',
    pending: 'pending',
    aceptado: 'accepted',
    accepted: 'accepted',
    rechazado: 'rejected',
    rejected: 'rejected',
  };

  return aliases[String(status || '').toLowerCase()] || status;
}

export function AdminOrdersPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const visibleOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('es-MX');

    return ORDERS.filter((order) => {
      const matchesStatus =
        activeFilter === 'all' || normalizeStatus(order.status) === activeFilter;
      const searchableText = [order.customerName, order.id]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('es-MX');
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  const userName = user?.nombre || user?.correo || 'Encargada';

  return (
    <div className="admin-orders-page">
      <aside className="orders-sidebar" aria-label="Navegación administrativa">
        <Link className="orders-sidebar__brand" to="/" aria-label="PuraVida inicio">
          <img src={brandLogo} alt="PuraVida" />
        </Link>

        <nav className="orders-sidebar__nav">
          {SIDE_NAVIGATION.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <button
                  type="button"
                  className="orders-sidebar__item orders-sidebar__item--disabled"
                  disabled
                  title="Próximamente"
                  key={item.label}
                >
                  <Icon size={21} strokeWidth={2} aria-hidden="true" />
                  {item.label}
                </button>
              );
            }

            return (
              <Link
                className={`orders-sidebar__item ${item.active ? 'orders-sidebar__item--active' : ''}`.trim()}
                to={item.to}
                key={item.label}
              >
                <Icon size={21} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="orders-sidebar__user">
          <span className="orders-sidebar__avatar" aria-hidden="true">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <span>
            <strong>{userName}</strong>
            <small>Encargada</small>
          </span>
        </div>
      </aside>

      <main className="admin-orders-page__main">
        <div className="admin-orders-page__topbar">
          <label className="admin-orders-search">
            <Search size={19} strokeWidth={2} aria-hidden="true" />
            <span className="admin-orders-search__label">Buscar pedidos</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar pedidos..."
            />
          </label>
          <button type="button" className="admin-orders-utility" disabled title="Próximamente">
            <Bell size={21} strokeWidth={2} aria-hidden="true" />
            <span className="admin-orders-utility__label">Notificaciones</span>
          </button>
          <button type="button" className="admin-orders-utility" disabled title="Próximamente">
            <Settings size={21} strokeWidth={2} aria-hidden="true" />
            <span className="admin-orders-utility__label">Configuración</span>
          </button>
        </div>

        <header className="admin-orders-page__header">
          <h1>Gestión de pedidos</h1>
          <p>Gestiona los pedidos entrantes de tu fonda.</p>
        </header>

        <div className="admin-orders-filters" aria-label="Filtrar pedidos por estado">
          {ORDER_FILTERS.map((filter) => (
            <button
              type="button"
              className={`admin-orders-filter ${activeFilter === filter.value ? 'admin-orders-filter--active' : ''}`.trim()}
              aria-pressed={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
              key={filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {visibleOrders.length ? (
          <section className="admin-orders-grid" aria-label="Listado de pedidos">
            {visibleOrders.map((order) => (
              <OrderCard order={order} actionsAvailable={false} key={order.id} />
            ))}
          </section>
        ) : (
          <section className="admin-orders-empty" aria-label="Estado de pedidos">
            <EmptyState
              title="Consulta de pedidos pendiente"
              message="La interfaz está lista, pero el frontend aún no tiene un endpoint definido para consultar pedidos reales."
            />
          </section>
        )}

        <p className="admin-orders-page__notice">
          Aceptar, rechazar, definir el tiempo estimado y capturar el motivo de rechazo se
          habilitarán cuando existan endpoints de pedidos en el frontend.
        </p>
      </main>
    </div>
  );
}
