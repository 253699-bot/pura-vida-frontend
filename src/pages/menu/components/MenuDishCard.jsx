import { useState } from 'react';
import { ChefHat, Coffee, Leaf, Minus, Plus, ShoppingBag, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../shared/utils/currency.js';

export const MENU_TYPE_DETAILS = {
  platillo_fuerte: {
    label: 'Plato fuerte',
    icon: Utensils,
    tone: 'main',
  },
  bebida: {
    label: 'Bebida',
    icon: Coffee,
    tone: 'drink',
  },
  complemento: {
    label: 'Acompañamiento',
    icon: Leaf,
    tone: 'side',
  },
  postre: {
    label: 'Postre',
    icon: ChefHat,
    tone: 'dessert',
  },
};

const DEFAULT_TYPE = {
  label: 'Platillo',
  icon: Utensils,
  tone: 'general',
};

export function MenuDishCard({
  item,
  isAuthenticated,
  canUseCart,
  canOrder,
  onAdd,
  operation,
}) {
  const type = MENU_TYPE_DETAILS[item.tipoPlatillo] || DEFAULT_TYPE;
  const Icon = type.icon;
  const [quantity, setQuantity] = useState(1);
  const isAdding = operation?.status === 'loading';

  function getActionLabel() {
    if (!item.disponible) {
      return 'No disponible';
    }

    if (!item.platilloId) {
      return 'Platillo no identificable';
    }

    if (!canOrder) {
      return 'Pedidos no disponibles';
    }

    return isAdding ? 'Agregando...' : 'Agregar al carrito';
  }

  return (
    <article className={`menu-dish-card ${item.disponible ? '' : 'menu-dish-card--sold-out'}`.trim()}>
      <div className={`menu-dish-card__media menu-dish-card__media--${type.tone}`}>
        <Icon size={48} strokeWidth={1.7} aria-hidden="true" />
        <span>{type.label}</span>
      </div>

      <div className="menu-dish-card__body">
        <div className="menu-dish-card__heading">
          <h2>{item.nombre}</h2>
          <strong>{formatCurrency(item.precio)}</strong>
        </div>
        <p>{item.descripcion || 'Platillo casero preparado para el menú de hoy.'}</p>
        <span
          className={`menu-dish-card__availability ${
            item.disponible
              ? 'menu-dish-card__availability--available'
              : 'menu-dish-card__availability--sold-out'
          }`}
        >
          {item.disponible ? 'Disponible' : 'Agotado'}
        </span>
        {canUseCart ? (
          <div className="menu-dish-card__purchase">
            <div className="menu-dish-card__quantity" aria-label={`Cantidad de ${item.nombre}`}>
              <button
                type="button"
                aria-label={`Disminuir cantidad de ${item.nombre}`}
                disabled={quantity === 1 || isAdding || !item.disponible || !canOrder}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <output aria-live="polite">{quantity}</output>
              <button
                type="button"
                aria-label={`Aumentar cantidad de ${item.nombre}`}
                disabled={isAdding || !item.disponible || !canOrder}
                onClick={() => setQuantity((current) => current + 1)}
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              className="menu-dish-card__action"
              disabled={
                isAdding || !item.disponible || !canOrder || !item.platilloId
              }
              onClick={() => onAdd(item, quantity)}
            >
              <ShoppingBag size={18} strokeWidth={2} aria-hidden="true" />
              {getActionLabel()}
            </button>
          </div>
        ) : !isAuthenticated && item.disponible ? (
          <Link
            className="menu-dish-card__action"
            to="/login"
            state={{ from: { pathname: '/menu' } }}
          >
            <ShoppingBag size={18} strokeWidth={2} aria-hidden="true" />
            Inicia sesión para pedir
          </Link>
        ) : (
          <button type="button" className="menu-dish-card__action" disabled>
            <ShoppingBag size={18} strokeWidth={2} aria-hidden="true" />
            {item.disponible ? 'Pedidos disponibles para clientes' : 'No disponible'}
          </button>
        )}
        {operation?.message ? (
          <p
            className={`menu-dish-card__feedback menu-dish-card__feedback--${operation.status}`}
            role={operation.status === 'error' ? 'alert' : 'status'}
          >
            {operation.message}
          </p>
        ) : null}
      </div>
    </article>
  );
}
