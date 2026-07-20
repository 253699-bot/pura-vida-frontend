import { getBusinessStatusLabel, normalizeBusinessStatus } from '../../../entities/business/businessModel.js';
import { formatDate } from '../../../shared/utils/date.js';
import { Card } from '../../../shared/ui/Card.jsx';

export function BusinessStatusCard({ status }) {
  const normalizedStatus = normalizeBusinessStatus(status);
  const isOpen = normalizedStatus.abierto === true;
  const isConfigured = normalizedStatus.configured;

  return (
    <Card>
      <div className="stack">
        <span className={`status-pill ${isOpen ? 'status-pill--open' : 'status-pill--closed'}`}>
          {getBusinessStatusLabel(normalizedStatus)}
        </span>
        <div>
          <h2 className="card__title">Estado de la fonda</h2>
          <p className="card__meta">{formatDate(normalizedStatus.fecha)}</p>
        </div>
        {!isConfigured ? (
          <p className="card__meta">Aún no se ha configurado el estado de hoy.</p>
        ) : normalizedStatus.abierto ? (
          <p className="card__meta">Estamos atendiendo con normalidad.</p>
        ) : (
          <p className="card__meta">
            {normalizedStatus.motivoCierre || 'Hoy no hay servicio disponible.'}
          </p>
        )}
      </div>
    </Card>
  );
}
