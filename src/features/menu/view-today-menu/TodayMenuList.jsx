import { formatCurrency } from '../../../shared/utils/currency.js';
import { EmptyState } from '../../../shared/ui/EmptyState.jsx';
import { Card } from '../../../shared/ui/Card.jsx';

export function TodayMenuList({ menu, renderActions }) {
  if (!menu?.configured) {
    return (
      <EmptyState
        title="Menu no configurado"
        message="Todavia no hay menu del dia disponible."
      />
    );
  }

  if (!menu.items.length) {
    return (
      <EmptyState
        title="Sin platillos"
        message="El menu de hoy no tiene platillos cargados."
      />
    );
  }

  return (
    <div className="menu-grid">
      {menu.items.map((item) => (
        <Card
          key={item.id || item.platilloId}
          className={`menu-item ${item.disponible ? '' : 'menu-item--disabled'}`}
        >
          <div className="menu-item__top">
            <h2 className="menu-item__name">{item.nombre}</h2>
            <span className="menu-item__price">{formatCurrency(item.precio)}</span>
          </div>
          <span className="menu-item__type">{item.tipoPlatillo}</span>
          {item.descripcion ? <p className="card__meta">{item.descripcion}</p> : null}
          <span className={`status-pill ${item.disponible ? 'status-pill--open' : 'status-pill--closed'}`}>
            {item.disponible ? 'Disponible' : 'Agotado'}
          </span>
          {renderActions ? <div className="actions">{renderActions(item)}</div> : null}
        </Card>
      ))}
    </div>
  );
}
