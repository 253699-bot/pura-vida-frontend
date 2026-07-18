import { Clock3, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTodayBusinessStatus } from '../../entities/business/businessApi.js';
import { BusinessStatusForm } from '../../features/business/update-status/BusinessStatusForm.jsx';
import { BusinessStatusCard } from '../../features/business/view-status/BusinessStatusCard.jsx';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { Card } from '../../shared/ui/Card.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';
import './BusinessStatusPage.css';

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
    <div className="business-status-layout">
      <AdminWorkspaceSidebar activePath="/admin/status" />

      <main className="business-status-page">
        <header className="business-status-page__header">
          <span className="business-status-page__heading-icon" aria-hidden="true">
            <Store size={28} />
          </span>
          <div>
            <p>Operación diaria</p>
            <h1>Estado del negocio</h1>
            <span>Comunica si PuraVida se encuentra abierta o cerrada durante el día.</span>
          </div>
        </header>

        <div className="business-status-page__content">
          <aside className="business-status-page__notice">
            <Clock3 size={21} aria-hidden="true" />
            <p>Los cambios guardados se reflejan en el menú público y en la disponibilidad para recibir pedidos.</p>
          </aside>

          {isLoading ? <Loading label="Cargando estado del negocio..." /> : null}
          <ErrorMessage title="Estado no disponible" message={error} />

          {status ? (
            <div className="business-status-grid">
              <div className="business-status-current">
                <BusinessStatusCard status={status} />
              </div>
              <Card className="business-status-editor">
                <div className="business-status-editor__heading">
                  <span>Configuración</span>
                  <h2>Actualizar estado</h2>
                  <p>Selecciona la condición del servicio y guarda el cambio para hoy.</p>
                </div>
                <BusinessStatusForm status={status} onUpdated={setStatus} />
              </Card>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
