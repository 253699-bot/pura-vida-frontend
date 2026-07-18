import {
  CalendarDays,
  Download,
  FileText,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Utensils,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  downloadWeeklyReportPdf,
  getWeeklyReportSummary,
} from '../../entities/reports/reportsApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../shared/ui/Input.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';
import './AdminWeeklyReportPage.css';

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('es-MX');

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

function formatDate(value) {
  if (!value) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function hasActivity(report) {
  const sales = report?.ventas;
  const orders = report?.pedidos;

  return Boolean(
    Number(sales?.cantidadActivas) ||
      Number(sales?.cantidadAnuladas) ||
      Number(orders?.pendientes) ||
      Number(orders?.aceptados) ||
      Number(orders?.rechazados) ||
      report?.topPlatillos?.length,
  );
}

export function AdminWeeklyReportPage() {
  const initialWeekStart = useMemo(getCurrentWeekStart, []);
  const [selectedWeekStart, setSelectedWeekStart] = useState(initialWeekStart);
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [refreshKey, setRefreshKey] = useState(0);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadReport() {
      setIsLoading(true);
      setError('');
      setDownloadMessage('');

      try {
        const data = await getWeeklyReportSummary(weekStart);
        if (isCurrent) setReport(data);
      } catch (requestError) {
        if (isCurrent) {
          setReport(null);
          setError(getApiMessage(requestError, 'No fue posible consultar el reporte semanal.'));
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadReport();
    return () => {
      isCurrent = false;
    };
  }, [weekStart, refreshKey]);

  const totalOrders =
    Number(report?.pedidos?.pendientes || 0) +
    Number(report?.pedidos?.aceptados || 0) +
    Number(report?.pedidos?.rechazados || 0);

  function handleGenerate(event) {
    event.preventDefault();

    if (!selectedWeekStart) {
      setError('Selecciona la fecha de inicio de la semana.');
      return;
    }

    if (selectedWeekStart === weekStart) {
      setRefreshKey((current) => current + 1);
    } else {
      setWeekStart(selectedWeekStart);
    }
  }

  async function handleDownload() {
    setIsDownloading(true);
    setDownloadError('');
    setDownloadMessage('');

    try {
      const pdfData = await downloadWeeklyReportPdf(weekStart);
      const pdfBlob = pdfData instanceof Blob ? pdfData : new Blob([pdfData], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `reporte-semanal-${weekStart}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setDownloadMessage('El reporte PDF se descargó correctamente.');
    } catch (requestError) {
      setDownloadError(getApiMessage(requestError, 'No fue posible descargar el reporte PDF.'));
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="weekly-report-layout">
      <AdminWorkspaceSidebar activePath="/admin/reports/weekly" />

      <main className="weekly-report-page">
        <header className="weekly-report-page__header">
          <div>
            <p>Reportes</p>
            <h1>Reporte semanal</h1>
            <span>Consulta el resumen operativo y descarga el documento oficial de cada semana.</span>
          </div>

          <form className="weekly-report-filter" onSubmit={handleGenerate}>
            <Input
              id="weekly-report-start"
              label="Inicio de semana"
              type="date"
              value={selectedWeekStart}
              onChange={(event) => setSelectedWeekStart(event.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !selectedWeekStart}>
              <RefreshCw size={17} aria-hidden="true" />
              {isLoading ? 'Generando...' : 'Generar reporte'}
            </Button>
          </form>
        </header>

        <div className="weekly-report-page__content">
          {isLoading ? <Loading label="Generando resumen semanal..." /> : null}
          {!isLoading && error ? <ErrorMessage title="Reporte no disponible" message={error} /> : null}

          {!isLoading && !error && report ? (
            <>
              <section className="weekly-report-hero">
                <div className="weekly-report-hero__icon" aria-hidden="true">
                  <FileText size={34} />
                </div>
                <div>
                  <span>Periodo consultado</span>
                  <h2>
                    {formatDate(report.semanaInicio || weekStart)} — {formatDate(report.semanaFin)}
                  </h2>
                  <p>Los importes excluyen ventas anuladas y reflejan la información actual de la API.</p>
                </div>
                <Button variant="secondary" onClick={handleDownload} disabled={isDownloading}>
                  <Download size={18} aria-hidden="true" />
                  {isDownloading ? 'Descargando...' : 'Descargar PDF'}
                </Button>
              </section>

              {downloadMessage ? (
                <div className="weekly-report-message weekly-report-message--success" role="status">
                  {downloadMessage}
                </div>
              ) : null}
              {downloadError ? <ErrorMessage title="Descarga no disponible" message={downloadError} /> : null}

              {!hasActivity(report) ? (
                <EmptyState
                  title="No hay actividad en esta semana"
                  message="El reporte existe, pero todavía no contiene ventas, pedidos ni platillos destacados."
                />
              ) : (
                <>
                  <section className="weekly-report-metrics" aria-label="Resumen semanal">
                    <article>
                      <span className="weekly-report-metrics__icon weekly-report-metrics__icon--income">
                        <TrendingUp size={22} aria-hidden="true" />
                      </span>
                      <div>
                        <small>Ingresos activos</small>
                        <strong>{currencyFormatter.format(Number(report.ventas?.totalActivo || 0))}</strong>
                        <em>{integerFormatter.format(Number(report.ventas?.cantidadActivas || 0))} ventas</em>
                      </div>
                    </article>
                    <article>
                      <span className="weekly-report-metrics__icon weekly-report-metrics__icon--orders">
                        <ShoppingBag size={22} aria-hidden="true" />
                      </span>
                      <div>
                        <small>Pedidos registrados</small>
                        <strong>{integerFormatter.format(totalOrders)}</strong>
                        <em>{integerFormatter.format(Number(report.pedidos?.aceptados || 0))} aceptados</em>
                      </div>
                    </article>
                    <article>
                      <span className="weekly-report-metrics__icon weekly-report-metrics__icon--top">
                        <Utensils size={22} aria-hidden="true" />
                      </span>
                      <div>
                        <small>Platillos destacados</small>
                        <strong>{integerFormatter.format(report.topPlatillos?.length || 0)}</strong>
                        <em>en el ranking semanal</em>
                      </div>
                    </article>
                  </section>

                  <div className="weekly-report-grid">
                    <section className="weekly-report-card">
                      <div className="weekly-report-card__heading">
                        <div>
                          <span>Detalle comercial</span>
                          <h2>Ventas por origen</h2>
                        </div>
                      </div>
                      <div className="weekly-report-channels">
                        <div>
                          <span>Ventas manuales</span>
                          <strong>{integerFormatter.format(Number(report.ventas?.manuales?.cantidad || 0))}</strong>
                          <em>{currencyFormatter.format(Number(report.ventas?.manuales?.total || 0))}</em>
                        </div>
                        <div>
                          <span>Ventas remotas</span>
                          <strong>{integerFormatter.format(Number(report.ventas?.remotas?.cantidad || 0))}</strong>
                          <em>{currencyFormatter.format(Number(report.ventas?.remotas?.total || 0))}</em>
                        </div>
                        <div>
                          <span>Ventas anuladas</span>
                          <strong>{integerFormatter.format(Number(report.ventas?.cantidadAnuladas || 0))}</strong>
                          <em>{currencyFormatter.format(Number(report.ventas?.totalAnulado || 0))}</em>
                        </div>
                      </div>
                    </section>

                    <section className="weekly-report-card">
                      <div className="weekly-report-card__heading">
                        <div>
                          <span>Operación</span>
                          <h2>Estado de pedidos</h2>
                        </div>
                      </div>
                      <div className="weekly-report-order-statuses">
                        <div><span>Pendientes</span><strong>{integerFormatter.format(Number(report.pedidos?.pendientes || 0))}</strong></div>
                        <div><span>Aceptados</span><strong>{integerFormatter.format(Number(report.pedidos?.aceptados || 0))}</strong></div>
                        <div><span>Rechazados</span><strong>{integerFormatter.format(Number(report.pedidos?.rechazados || 0))}</strong></div>
                      </div>
                    </section>
                  </div>

                  <section className="weekly-report-card weekly-report-card--table">
                    <div className="weekly-report-card__heading">
                      <div>
                        <span>Ranking de la semana</span>
                        <h2>Platillos más vendidos</h2>
                      </div>
                    </div>
                    {report.topPlatillos?.length ? (
                      <div className="weekly-report-table-wrap">
                        <table className="weekly-report-table">
                          <thead>
                            <tr><th>#</th><th>Platillo</th><th>Cantidad</th><th>Total generado</th></tr>
                          </thead>
                          <tbody>
                            {report.topPlatillos.map((dish, index) => (
                              <tr key={dish.platilloId || `${dish.nombre}-${index}`}>
                                <td>{index + 1}</td>
                                <td>{dish.nombre || 'Platillo sin nombre'}</td>
                                <td>{integerFormatter.format(Number(dish.cantidadVendida || 0))}</td>
                                <td>{currencyFormatter.format(Number(dish.totalGenerado || 0))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState title="Sin platillos destacados" message="No hay partidas vendidas para este periodo." />
                    )}
                  </section>
                </>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
