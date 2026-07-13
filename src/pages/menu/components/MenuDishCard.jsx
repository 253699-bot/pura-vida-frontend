import { ChefHat, Coffee, Leaf, ShoppingBag, Utensils } from 'lucide-react';
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

export function MenuDishCard({ item }) {
  const type = MENU_TYPE_DETAILS[item.tipoPlatillo] || DEFAULT_TYPE;
  const Icon = type.icon;

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
        <button
          type="button"
          className="menu-dish-card__action"
          disabled
          aria-label={`${item.nombre}: pedidos próximamente`}
        >
          <ShoppingBag size={18} strokeWidth={2} aria-hidden="true" />
          {item.disponible ? 'Pedidos próximamente' : 'No disponible'}
        </button>
      </div>
    </article>
  );
}
