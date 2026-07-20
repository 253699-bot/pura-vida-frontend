import { useEffect, useState } from 'react';
import { getTodayBusinessStatus } from '../../entities/business/businessApi.js';
import { BusinessStatusForm } from '../../features/business/update-status/BusinessStatusForm.jsx';
import { BusinessStatusCard } from '../../features/business/view-status/BusinessStatusCard.jsx';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { Card } from '../../shared/ui/Card.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';

export function BusinessStatusPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const todayStatus = await getTodayBusinessStatus();

        if (isMounted) {
          setStatus(todayStatus);
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiMessage(apiError, 'No se pudo consultar el estado de hoy.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">Estado de fonda</h1>
        <p className="page__subtitle">Actualiza si PuraVida está abierta o cerrada hoy.</p>
      </header>
      {isLoading ? <Loading label="Cargando estado..." /> : null}
      <ErrorMessage message={error} />
      {status ? (
        <div className="section-grid">
          <BusinessStatusCard status={status} />
          <Card>
            <div className="stack">
              <h2 className="card__title">Actualizar estado</h2>
              <BusinessStatusForm status={status} onUpdated={setStatus} />
            </div>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
