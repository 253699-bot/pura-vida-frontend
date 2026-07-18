import { useMemo, useState } from 'react';
import {
  Bell,
  ClipboardList,
  Search,
  Settings,
} from 'lucide-react';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';
import { OrderCard } from './components/OrderCard.jsx';
import './AdminOrdersPage.css';

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

  return (
    <div className="admin-orders-page">
      <AdminWorkspaceSidebar activePath="/admin/pedidos" />

      <main className="admin-orders-page__main">
        <header className="admin-orders-page__header">
          <div className="admin-orders-page__title">
            <span className="admin-orders-page__heading-icon" aria-hidden="true">
              <ClipboardList size={28} />
            </span>
            <div>
              <p>Operación</p>
              <h1>Gestión de pedidos</h1>
              <span>Consulta y administra los pedidos entrantes de PuraVida.</span>
            </div>
          </div>

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
        </header>

        <div className="admin-orders-page__content">
          <section className="admin-orders-toolbar" aria-label="Herramientas de pedidos">
            <div>
              <span>Vista actual</span>
              <h2>Pedidos registrados</h2>
              <p>Filtra la bandeja por el estado operativo de cada pedido.</p>
            </div>
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
          </section>

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
        </div>
      </main>
    </div>
  );
}
