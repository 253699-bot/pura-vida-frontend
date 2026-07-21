import { Download, RefreshCw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  createWeeklyReport,
  downloadStoredWeeklyReportPdf,
  getWeeklyReportSummary,
  listWeeklyReports,
} from '../../entities/reports/reportsApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../shared/ui/Input.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import { AdminHeaderActions } from './components/AdminHeaderActions.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';

import './AdminWeeklyReportPage.css';
import './components/AdminPageHeader.css';

function toLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getCurrentWeekStart() {
  const date = new Date();
  const daysSinceMonday = (date.getDay() + 6) % 7;

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysSinceMonday);

  return toLocalIsoDate(date);
}

function isMonday(value) {
  if (!value) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return date.getDay() === 1;
}

function formatDate(value) {
  if (!value) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function downloadBlob(data, fileName) {
  const blob =
    data instanceof Blob
      ? data
      : new Blob([data], { type: 'application/pdf' });

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(objectUrl);
}

export function AdminWeeklyReportPage() {
  const initialWeekStart = useMemo(getCurrentWeekStart, []);

  const [selectedWeekStart, setSelectedWeekStart] =
    useState(initialWeekStart);
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [message, setMessage] = useState('');

  async function loadReports() {
    setIsLoadingReports(true);
    setHistoryError('');

    try {
      setReports(await listWeeklyReports());
    } catch (requestError) {
      setHistoryError(
        getApiMessage(
          requestError,
          'No fue posible consultar los reportes guardados.',
        ),
      );
    } finally {
      setIsLoadingReports(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function loadSummary() {
      setIsLoadingSummary(true);
      setError('');

      try {
        const data = await getWeeklyReportSummary(selectedWeekStart);

        if (isCurrent) {
          setSummary(data);
        }
      } catch (requestError) {
        if (isCurrent) {
          setError(
            getApiMessage(
              requestError,
              'No fue posible consultar el resumen semanal.',
            ),
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoadingSummary(false);
        }
      }
    }

    loadSummary();

    return () => {
      isCurrent = false;
    };
  }, [selectedWeekStart]);

  async function handleCreate(event) {
    event.preventDefault();

    setMessage('');
    setError('');

    if (!isMonday(selectedWeekStart)) {
      setError('El inicio de semana debe ser lunes.');
      return;
    }

    setIsCreating(true);

    try {
      const storedReport = await createWeeklyReport(selectedWeekStart);

      setMessage(`Reporte #${storedReport.id} guardado.`);

      await loadReports();
    } catch (requestError) {
      setError(
        getApiMessage(
          requestError,
          'No fue posible guardar el reporte semanal.',
        ),
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDownload(report) {
    setDownloadingId(report.id);
    setHistoryError('');

    try {
      const pdfData = await downloadStoredWeeklyReportPdf(report.id);

      downloadBlob(
        pdfData,
        `reporte-semanal-${report.semanaInicio}.pdf`,
      );
    } catch (requestError) {
      setHistoryError(
        getApiMessage(
          requestError,
          'No fue posible descargar el PDF histórico.',
        ),
      );
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="weekly-report-layout">
      <AdminWorkspaceSidebar activePath="/admin/reports" />

      <main className="weekly-report-page">
        <header className="weekly-report-page__header">
          <div>
            <p>Reportes</p>

            <h1 className="admin-page-header__title">
              Reportes semanales
            </h1>

            <span>
              Genera snapshots históricos y descarga PDFs guardados por
              semana.
            </span>
          </div>

          <div className="weekly-report-page__actions">
            <AdminHeaderActions />
          </div>
        </header>

        <div className="weekly-report-page__content">
          {message ? (
            <div
              className="weekly-report-message weekly-report-message--success"
              role="status"
            >
              {message}
            </div>
          ) : null}

          <ErrorMessage
            title="Reporte no disponible"
            message={error}
          />

          <section className="weekly-report-hero">
            <div className="weekly-report-hero__summary">
              <span>Resumen vivo</span>

              <h2>
                {formatDate(
                  summary?.semanaInicio || selectedWeekStart,
                )}{' '}
                - {formatDate(summary?.semanaFin)}
              </h2>

              <p>
                Este resumen se consulta en vivo; el botón guardar
                conserva un snapshot histórico.
              </p>

              <Button
                variant="secondary"
                onClick={() =>
                  setSelectedWeekStart(getCurrentWeekStart())
                }
                disabled={isLoadingSummary}
              >
                <RefreshCw size={18} aria-hidden="true" />
                Semana actual
              </Button>
            </div>

            <form
              className="weekly-report-filter"
              onSubmit={handleCreate}
            >
              <Input
                id="weekly-report-start"
                label="Inicio de semana"
                type="date"
                value={selectedWeekStart}
                onChange={(event) =>
                  setSelectedWeekStart(event.target.value)
                }
                disabled={isCreating}
              />

              <Button
                type="submit"
                disabled={isCreating || !selectedWeekStart}
              >
                <Save size={17} aria-hidden="true" />
                {isCreating ? 'Guardando...' : 'Guardar reporte'}
              </Button>
            </form>
          </section>

          {isLoadingSummary ? (
            <Loading label="Cargando resumen semanal..." />
          ) : null}

          <section className="weekly-report-card weekly-report-card--table">
            <div className="weekly-report-card__heading">
              <div>
                <span>Historial</span>
                <h2>Reportes guardados</h2>
              </div>
            </div>

            {isLoadingReports ? (
              <Loading label="Cargando historial..." />
            ) : null}

            <ErrorMessage message={historyError} />

            {!isLoadingReports &&
            !historyError &&
            !reports.length ? (
              <EmptyState
                title="Sin reportes guardados"
                message="Guarda el primer snapshot semanal para iniciar el historial."
              />
            ) : null}

            {reports.length ? (
              <div className="weekly-report-table-wrap">
                <table className="weekly-report-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Semana</th>
                      <th>Pedidos app</th>
                      <th>Ingresos</th>
                      <th>Snapshot</th>
                      <th>PDF</th>
                    </tr>
                  </thead>

                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>#{report.id}</td>

                        <td>
                          {formatDate(report.semanaInicio)} -{' '}
                          {formatDate(report.semanaFin)}
                        </td>

                        <td>{report.totalPedidosApp}</td>

                        <td>
                          {formatCurrency(report.totalIngresos)}
                        </td>

                        <td>
                          {report.snapshotDisponible
                            ? `v${report.versionFormato || 1}`
                            : 'No disponible'}
                        </td>

                        <td>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={
                              !report.snapshotDisponible ||
                              downloadingId === report.id
                            }
                            onClick={() => handleDownload(report)}
                          >
                            <Download
                              size={16}
                              aria-hidden="true"
                            />

                            {downloadingId === report.id
                              ? 'Descargando...'
                              : 'PDF'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}