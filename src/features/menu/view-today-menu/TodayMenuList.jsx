import { useEffect, useState } from 'react';
import { Utensils } from 'lucide-react';
import { versionAssetUrl } from '../../../shared/api/assets.js';
import { formatCurrency } from '../../../shared/utils/currency.js';
import { EmptyState } from '../../../shared/ui/EmptyState.jsx';
import { Card } from '../../../shared/ui/Card.jsx';

function TodayMenuItemCard({ item, renderActions }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = versionAssetUrl(item.imagenUrl, item.imagenVersion);
  const hasImage = Boolean(imageSrc) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  return (
    <Card className={`menu-item ${item.disponible ? '' : 'menu-item--disabled'}`.trim()}>
      <div className={`menu-item__media ${hasImage ? 'menu-item__media--image' : ''}`.trim()}>
        {hasImage ? (
          <img src={imageSrc} alt={`Foto de ${item.nombre}`} onError={() => setImageFailed(true)} />
        ) : (
          <Utensils size={30} strokeWidth={1.7} aria-hidden="true" />
        )}
      </div>
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
  );
}

export function TodayMenuList({ menu, renderActions }) {
  if (!menu?.configured) {
    return (
      <EmptyState
        title="Menú no configurado"
        message="Todavía no hay menú del día disponible."
      />
    );
  }

  if (!menu.items.length) {
    return (
      <EmptyState
        title="Sin platillos"
        message="El menú de hoy no tiene platillos cargados."
      />
    );
  }

  return (
    <div className="menu-grid">
      {menu.items.map((item) => (
        <TodayMenuItemCard
          key={item.id || item.platilloId}
          item={item}
          renderActions={renderActions}
        />
      ))}
    </div>
  );
}
