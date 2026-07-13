import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Store, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayBusinessStatus } from '../../entities/business/businessApi.js';
import { getTodayMenu } from '../../entities/menu/menuApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { MenuDishCard, MENU_TYPE_DETAILS } from './components/MenuDishCard.jsx';
import './MenuPage.css';

const MENU_FILTERS = [
  { value: 'todos', label: 'Todos', icon: LayoutGrid },
  {
    value: 'platillo_fuerte',
    label: 'Platos fuertes',
    icon: MENU_TYPE_DETAILS.platillo_fuerte.icon,
  },
  { value: 'bebida', label: 'Bebidas', icon: MENU_TYPE_DETAILS.bebida.icon },
  {
    value: 'complemento',
    label: 'Acompañamientos',
    icon: MENU_TYPE_DETAILS.complemento.icon,
  },
  { value: 'postre', label: 'Postres', icon: MENU_TYPE_DETAILS.postre.icon },
];

function getBusinessStatusView(status, hasError, isLoading) {
  if (isLoading) {
    return {
      label: 'Consultando estado de la fonda',
      description: 'Verificando la disponibilidad de hoy.',
      tone: 'neutral',
    };
  }

  if (hasError) {
    return {
      label: 'Estado de la fonda no disponible',
      description: 'El menú público sigue disponible para consulta.',
      tone: 'neutral',
    };
  }

  if (!status?.configured || status.abierto === null) {
    return {
      label: 'Estado de la fonda no configurado',
      description: 'Consulta el menú de hoy y vuelve más tarde para confirmar disponibilidad.',
      tone: 'neutral',
    };
  }

  return status.abierto
    ? {
        label: 'Fonda abierta hoy',
        description: 'Estamos atendiendo con normalidad.',
        tone: 'open',
      }
    : {
        label: 'Fonda cerrada hoy',
        description: status.motivoCierre || 'El menú se muestra para consulta.',
        tone: 'closed',
      };
}

export function MenuPage() {
  const { isAuthenticated } = useAuth();
  const [businessStatus, setBusinessStatus] = useState(null);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState('');
  const [hasStatusError, setHasStatusError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todos');
  const businessStatusView = getBusinessStatusView(businessStatus, hasStatusError, isLoading);

  const visibleItems = useMemo(() => {
    if (!menu?.items) {
      return [];
    }

    if (activeFilter === 'todos') {
      return menu.items;
    }

    return menu.items.filter((item) => item.tipoPlatillo === activeFilter);
  }, [activeFilter, menu]);

  useEffect(() => {
    let isMounted = true;

    async function loadPublicData() {
      const [menuResult, statusResult] = await Promise.allSettled([
        getTodayMenu(),
        getTodayBusinessStatus(),
      ]);

      if (!isMounted) {
        return;
      }

      if (menuResult.status === 'fulfilled') {
        setMenu(menuResult.value);
      } else {
        setError(getApiMessage(menuResult.reason, 'No se pudo consultar el menú del día.'));
      }

      if (statusResult.status === 'fulfilled') {
        setBusinessStatus(statusResult.value);
        setHasStatusError(false);
      } else {
        setHasStatusError(true);
      }

      setIsLoading(false);
    }

    loadPublicData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="public-menu">
      <header className="public-menu__intro">
        <div className="public-menu__copy">
          <h1>Menú del día</h1>
          <p>
            Disfruta de nuestros platillos caseros preparados con ingredientes locales y frescos.
            Sabor auténtico para nutrir tu día.
          </p>
          <div
            className={`public-menu__business-status public-menu__business-status--${businessStatusView.tone}`}
          >
            <Store size={20} strokeWidth={2} aria-hidden="true" />
            <div>
              <strong>{businessStatusView.label}</strong>
              <span>{businessStatusView.description}</span>
            </div>
          </div>
        </div>

        <aside className="public-menu__order-note">
          <UserCircle size={26} strokeWidth={2} aria-hidden="true" />
          <div>
            <strong>
              {isAuthenticated ? 'Pedidos en línea próximamente' : 'Inicia sesión para realizar pedidos'}
            </strong>
            <span>Esta opción se habilitará cuando el backend de pedidos esté disponible.</span>
          </div>
          {!isAuthenticated ? <Link to="/login">Iniciar sesión</Link> : null}
        </aside>
      </header>

      {menu?.configured && menu.items.length ? (
        <div className="public-menu__filters" aria-label="Filtrar menú por tipo">
          {MENU_FILTERS.map((filter) => {
            const Icon = filter.icon;

            return (
              <button
                type="button"
                className="public-menu__filter"
                aria-pressed={activeFilter === filter.value}
                aria-controls="today-menu-grid"
                onClick={() => setActiveFilter(filter.value)}
                key={filter.value}
              >
                <Icon size={17} strokeWidth={2} aria-hidden="true" />
                {filter.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <section className="public-menu__content" id="today-menu-grid" aria-live="polite">
        {isLoading ? <Loading label="Cargando menú..." /> : null}
        <ErrorMessage message={error} />
        {!isLoading && !error && menu && !menu.configured ? (
          <EmptyState
            title="Menú no configurado"
            message="Todavía no hay menú del día disponible. Vuelve a consultar más tarde."
          />
        ) : null}
        {!isLoading && !error && menu?.configured && !menu.items.length ? (
          <EmptyState title="Sin platillos" message="El menú de hoy todavía no tiene platillos." />
        ) : null}
        {!isLoading && !error && menu?.configured && menu.items.length && !visibleItems.length ? (
          <EmptyState
            title="Sin opciones en esta categoría"
            message="Prueba con otro filtro para consultar el menú de hoy."
          />
        ) : null}
        {visibleItems.length ? (
          <div className="public-menu__grid">
            {visibleItems.map((item) => (
              <MenuDishCard item={item} key={item.id || item.platilloId} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
