import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, ShoppingCart, Store, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayBusinessStatus } from '../../entities/business/businessApi.js';
import { addCartItem } from '../../entities/cart/cartApi.js';
import { getTodayMenu } from '../../entities/menu/menuApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { CART_UPDATED_EVENT } from '../../shared/constants/events.js';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatDate } from '../../shared/utils/date.js';
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
  const { isAuthenticated, isEncargada } = useAuth();
  const [businessStatus, setBusinessStatus] = useState(null);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState('');
  const [hasStatusError, setHasStatusError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [itemOperations, setItemOperations] = useState({});
  const businessStatusView = getBusinessStatusView(businessStatus, hasStatusError, isLoading);
  const canUseCart = isAuthenticated && !isEncargada;
  const canOrder = Boolean(
    canUseCart && businessStatus?.configured && businessStatus.abierto === true,
  );
  const isBusinessClosed = Boolean(
    !isLoading && !hasStatusError && businessStatus?.configured && businessStatus.abierto === false,
  );

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

  async function handleAddToCart(item, cantidad) {
    const key = item.id ?? item.platilloId;

    if (!key || itemOperations[key]?.status === 'loading') {
      return;
    }

    if (!item.platilloId) {
      setItemOperations((current) => ({
        ...current,
        [key]: {
          status: 'error',
          message: 'No fue posible identificar este platillo.',
        },
      }));
      return;
    }

    setItemOperations((current) => ({
      ...current,
      [key]: { status: 'loading', message: '' },
    }));

    try {
      await addCartItem(item.platilloId, cantidad);
      setItemOperations((current) => ({
        ...current,
        [key]: {
          status: 'success',
          message: `${item.nombre} se agregó al carrito.`,
        },
      }));
      window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    } catch (requestError) {
      setItemOperations((current) => ({
        ...current,
        [key]: {
          status: 'error',
          message: getApiMessage(requestError, 'No se pudo agregar el platillo al carrito.'),
        },
      }));
    }
  }

  return (
    <main className="public-menu">
      <header className="public-menu__intro">
        <div className="public-menu__copy">
          <h1>Menú del día</h1>
          <p>
            Disfruta de nuestros platillos caseros preparados con ingredientes locales y frescos.
            Sabor auténtico para nutrir tu día.
          </p>
          {menu?.fecha ? (
            <span className="public-menu__date">Menú para {formatDate(menu.fecha)}</span>
          ) : null}
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
          {canUseCart ? (
            <ShoppingCart size={26} strokeWidth={2} aria-hidden="true" />
          ) : (
            <UserCircle size={26} strokeWidth={2} aria-hidden="true" />
          )}
          <div>
            <strong>
              {canUseCart
                ? 'Arma tu pedido'
                : isEncargada
                  ? 'Consulta el menú publicado'
                  : 'Inicia sesión para realizar pedidos'}
            </strong>
            <span>
              {canUseCart
                ? canOrder
                  ? 'Agrega platillos disponibles y confirma tu pedido desde el carrito.'
                  : 'Los pedidos se habilitan cuando la fonda está abierta.'
                : isEncargada
                  ? 'Las acciones de compra están disponibles únicamente para clientes.'
                : 'Accede a tu cuenta para agregar platillos al carrito.'}
            </span>
          </div>
          <Link to={canUseCart ? '/carrito' : isEncargada ? '/admin' : '/login'}>
            {canUseCart ? 'Ver carrito' : isEncargada ? 'Volver al panel' : 'Iniciar sesión'}
          </Link>
        </aside>
      </header>

      {menu?.configured && menu.items.length && !isBusinessClosed ? (
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
        {!isLoading && !error && isBusinessClosed ? (
          <section className="public-menu-closed" aria-live="polite">
            <Store size={44} strokeWidth={1.8} aria-hidden="true" />
            <div>
              <h2>La fonda está cerrada</h2>
              <p>{businessStatus?.motivoCierre || 'Por ahora no se pueden consultar platillos ni realizar pedidos.'}</p>
            </div>
          </section>
        ) : null}
        {!isLoading && !error && !isBusinessClosed && menu && !menu.configured ? (
          <EmptyState
            title="Menú no configurado"
            message="Todavía no hay menú del día disponible. Vuelve más tarde."
          />
        ) : null}
        {!isLoading && !error && !isBusinessClosed && menu?.configured && !menu.items.length ? (
          <EmptyState title="Sin platillos" message="El menú de hoy todavía no tiene platillos." />
        ) : null}
        {!isLoading && !error && !isBusinessClosed && menu?.configured && menu.items.length && !visibleItems.length ? (
          <EmptyState
            title="Sin opciones en esta categoría"
            message="Prueba con otro filtro para consultar el menú de hoy."
          />
        ) : null}
        {!isBusinessClosed && visibleItems.length ? (
          <div className="public-menu__grid">
            {visibleItems.map((item) => (
              <MenuDishCard
                item={item}
                isAuthenticated={isAuthenticated}
                canUseCart={canUseCart}
                canOrder={canOrder}
                onAdd={handleAddToCart}
                operation={itemOperations[item.id ?? item.platilloId]}
                key={item.id || item.platilloId}
              />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
