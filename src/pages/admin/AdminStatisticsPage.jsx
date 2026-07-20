import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ClipboardList,
  Clock3,
  TrendingUp,
  Utensils,
  Wallet,
} from 'lucide-react';
import {
  getRangeStatistics,
  getWeeklyStatistics,
} from '../../entities/statistics/statisticsApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import { formatDate } from '../../shared/utils/date.js';
import { AdminHeaderActions } from './components/AdminHeaderActions.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';

import './AdminStatisticsPage.css';
import './components/AdminPageHeader.css';

const STATISTICS_MODES = [
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'range', label: 'Rango', icon: CalendarDays },
];

const SOURCE_METRICS = [
  { id: 'total', label: 'Importe' },
  { id: 'count', label: 'Ventas' },
  { id: 'average', label: 'Ticket' },
];

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTodayIso() {
  return toIsoDate(new Date());
}

function getCurrentWeekStartIso() {
  const date = new Date();
  const day = date.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - daysSinceMonday);

  return toIsoDate(date);
}

function getCurrentMonthStartIso() {
  const today = new Date();

  return toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1));
}

function getCurrentMonthEndIso() {
  const today = new Date();

  return toIsoDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
}

function createDefaultRange() {
  return {
    from: getCurrentMonthStartIso(),
    to: getTodayIso(),
  };
}

function getPercent(value, maximum) {
  if (!maximum || !value) {
    return 0;
  }

  return Math.max(8, Math.round((value / maximum) * 100));
}

function formatShortDate(value) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: '2-digit' })
    .format(new Date(`${value}T00:00:00`));
}

function formatCompactDate(value) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' })
    .format(new Date(`${value}T00:00:00`));
}

function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function ticketAverage(total, count) {
  return count ? total / count : 0;
}

function SummaryCard({ icon: Icon, label, value, tone = 'green', detail }) {
  return (
    <article className="statistics-summary-card">
      <span className={`statistics-summary-card__icon statistics-summary-card__icon--${tone}`} aria-hidden="true">
        <Icon size={25} strokeWidth={2} />
      </span>
      <div>
        <span>{label}</span>
        <strong title={value}>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
    </article>
  );
}

function SalesBarsPanel({ title, eyebrow, items, labelForItem, metric = 'amount', scrollable = false }) {
  const getMetricValue = (item) => (metric === 'count' ? item.count : item.total);
  const maximum = Math.max(...items.map(getMetricValue), 0);
  const hasData = items.some((item) => item.total > 0 || item.count > 0);
  const formatMetricValue = (item) => (metric === 'count' ? String(item.count) : formatCurrency(item.total));
  const formatAuxiliaryValue = (item) => (metric === 'count'
    ? (item.count === 1 ? 'venta' : 'ventas')
    : `${item.count} ventas`);

  return (
    <section className="statistics-panel" aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-title`}>
      <div className="statistics-panel__header">
        <div>
          <p>{eyebrow}</p>
          <h2 id={`${title.replace(/\s+/g, '-').toLowerCase()}-title`}>{title}</h2>
        </div>
      </div>
      {hasData ? (
        <div className={scrollable ? 'statistics-sales-chart-scroll' : undefined}>
          <div className={`statistics-sales-chart ${scrollable ? 'statistics-sales-chart--scrollable' : ''}`.trim()} aria-label={title}>
            {items.map((item) => {
              const label = labelForItem(item);
              const value = getMetricValue(item);
              const readable = metric === 'count'
                ? `${label}: ${item.count} ventas`
                : `${label}: ${formatCurrency(item.total)} en ${item.count} ventas`;

              return (
                <div className="statistics-sales-chart__item" key={`${label}-${item.from ?? item.date ?? item.hour}`} title={readable}>
                  <strong>{formatMetricValue(item)}</strong>
                  <span className="statistics-sales-chart__track" aria-hidden="true">
                    <span
                      className="statistics-sales-chart__bar"
                      style={{ height: `${getPercent(value, maximum)}%` }}
                    />
                  </span>
                  <small>{label}</small>
                  <em>{formatAuxiliaryValue(item)}</em>
                  <span className="statistics-sales-chart__sr">{readable}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState title="Sin ventas" message="No hay ventas válidas para graficar en este periodo." />
      )}
    </section>
  );
}

function SalesLinePanel({ items }) {
  const maximum = Math.max(...items.map((item) => item.total), 0);
  const hasData = items.some((item) => item.total > 0);
  const width = 760;
  const height = 220;
  const pointGap = items.length > 1 ? width / (items.length - 1) : width;
  const points = items.map((item, index) => {
    const x = items.length > 1 ? index * pointGap : width / 2;
    const y = maximum ? height - ((item.total / maximum) * (height - 18)) : height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <section className="statistics-panel statistics-panel--wide" aria-labelledby="monthly-sales-trend-title">
      <div className="statistics-panel__header">
        <div>
          <p>Ingresos</p>
          <h2 id="monthly-sales-trend-title">Tendencia de ventas del mes</h2>
        </div>
      </div>
      {hasData ? (
        <div className="statistics-line-chart-scroll">
          <svg className="statistics-line-chart" viewBox={`0 0 ${width} ${height + 42}`} role="img" aria-label="Total vendido por día del mes">
            <polyline className="statistics-line-chart__line" points={points} fill="none" />
            {items.map((item, index) => {
              const x = items.length > 1 ? index * pointGap : width / 2;
              const y = maximum ? height - ((item.total / maximum) * (height - 18)) : height;
              return (
                <g key={item.date}>
                  <circle cx={x} cy={y} r="4" />
                  {(index === 0 || index === items.length - 1 || item.total === maximum) ? (
                    <text x={x} y={height + 28} textAnchor={index === 0 ? 'start' : index === items.length - 1 ? 'end' : 'middle'}>
                      {formatCompactDate(item.date)}
                    </text>
                  ) : null}
                  <title>{`${formatCompactDate(item.date)}: ${formatCurrency(item.total)} en ${item.count} ventas`}</title>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <EmptyState title="Sin ventas" message="El mes no registra ventas válidas todavía." />
      )}
    </section>
  );
}

function PeakHourPanel({ items }) {
  return (
    <section className="statistics-panel" aria-labelledby="peak-hour-title">
      <div className="statistics-panel__header">
        <div>
          <p>Operación</p>
          <h2 id="peak-hour-title">Hora pico por día</h2>
        </div>
      </div>
      <div className="statistics-peak-hours">
        {items.map((item) => (
          <article key={item.date} className={item.count ? 'statistics-peak-hours__item' : 'statistics-peak-hours__item statistics-peak-hours__item--empty'}>
            <span>{formatShortDate(item.date)}</span>
            {item.count ? (
              <>
                <strong>{formatHour(item.hour)}</strong>
                <small>{item.count} {item.count === 1 ? 'venta' : 'ventas'}</small>
              </>
            ) : (
              <strong>Sin ventas</strong>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function TopDishesPanel({ items, subtitle = 'Con ventas activas y pedidos finalizados.' }) {
  const maximum = Math.max(...items.map((item) => item.quantity), 0);

  return (
    <section className="statistics-panel" aria-labelledby="top-dishes-title">
      <div className="statistics-panel__header">
        <div>
          <p>Preferencias</p>
          <h2 id="top-dishes-title">Platillos más pedidos</h2>
          <span className="statistics-panel__subtitle">{subtitle}</span>
        </div>
      </div>
      <div className="statistics-ranking">
        {items.length > 0 ? items.map((item, index) => (
          <div className="statistics-ranking__row" key={item.id || `${item.name}-${index}`}>
            <span className="statistics-ranking__name" title={item.name}>{item.name}</span>
            <span className="statistics-ranking__track" aria-hidden="true">
              <span
                className={`statistics-ranking__bar statistics-ranking__bar--${Math.min(index + 1, 5)}`}
                style={{ width: `${getPercent(item.quantity, maximum)}%` }}
              />
            </span>
            <strong>{item.quantity}</strong>
          </div>
        )) : (
          <EmptyState title="Sin platillos vendidos" message="No hay desglose de platillos para este periodo." />
        )}
      </div>
    </section>
  );
}

function OrderStatusPanel({ statuses }) {
  const items = [
    { label: 'Pendientes', value: statuses.pending, tone: 'warning' },
    { label: 'Aceptados', value: statuses.accepted, tone: 'success' },
    { label: 'Rechazados', value: statuses.rejected, tone: 'error' },
    { label: 'Finalizados', value: statuses.finalized, tone: 'completed' },
  ];
  const maximum = Math.max(...items.map((item) => item.value), 0);

  return (
    <section className="statistics-panel" aria-labelledby="order-status-title">
      <div className="statistics-panel__header">
        <div>
          <p>Operación</p>
          <h2 id="order-status-title">Pedidos por estado</h2>
        </div>
      </div>
      <div className="statistics-order-chart" aria-label="Distribución de pedidos por estado">
        {items.map((item) => (
          <div className="statistics-order-chart__item" key={item.label} title={`${item.label}: ${item.value}`}>
            <strong>{item.value}</strong>
            <span className="statistics-order-chart__track" aria-hidden="true">
              <span
                className={`statistics-order-chart__bar statistics-order-chart__bar--${item.tone}`}
                style={{ height: `${getPercent(item.value, maximum)}%` }}
              />
            </span>
            <small>{item.label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrdersByWeekPanel({ items }) {
  const maximum = Math.max(...items.map((item) => item.count), 0);

  return (
    <section className="statistics-panel" aria-labelledby="orders-by-week-title">
      <div className="statistics-panel__header">
        <div>
          <p>Pedidos aceptados/finalizados</p>
          <h2 id="orders-by-week-title">Pedidos por semana del mes</h2>
          <span className="statistics-panel__subtitle">Semana 1 inicia el día 1 del mes; cada bloque dura hasta 7 días.</span>
        </div>
      </div>
      <div className="statistics-week-bars">
        {items.map((item) => (
          <article key={item.week}>
            <strong>{item.count}</strong>
            <span aria-hidden="true">
              <span style={{ width: `${getPercent(item.count, maximum)}%` }} />
            </span>
            <small>Semana {item.week}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function SalesSourcesChart({ sales, title = 'Comparación por origen' }) {
  const [metric, setMetric] = useState('total');
  const sources = [
    { id: 'manual', label: 'Presencial', count: sales.manual.count, total: sales.manual.total },
    { id: 'remote', label: 'Aplicación', count: sales.remote.count, total: sales.remote.total },
  ].map((source) => ({
    ...source,
    average: ticketAverage(source.total, source.count),
  }));
  const maximum = Math.max(...sources.map((source) => source[metric]), 0);
  const hasData = sources.some((source) => source.count > 0 || source.total > 0);

  function formatMetricValue(value) {
    if (metric === 'count') return `${value}`;
    return formatCurrency(value);
  }

  return (
    <section className="statistics-panel statistics-panel--source" aria-labelledby="sales-source-title">
      <div className="statistics-panel__header statistics-panel__header--with-tabs">
        <div>
          <p>Origen</p>
          <h2 id="sales-source-title">{title}</h2>
          <div className="statistics-source-tabs" role="group" aria-label="Métrica de origen">
            {SOURCE_METRICS.map((item) => (
              <button type="button" aria-pressed={metric === item.id} onClick={() => setMetric(item.id)} key={item.id}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {hasData ? (
        <div className="statistics-source-chart">
          {sources.map((source) => (
            <article key={source.id}>
              <div>
                <strong>{source.label}</strong>
                <span>{source.count} ventas - {formatCurrency(source.total)} - ticket {formatCurrency(source.average)}</span>
              </div>
              <span className="statistics-source-chart__track" aria-hidden="true">
                <span style={{ width: `${getPercent(source[metric], maximum)}%` }} />
              </span>
              <em>{formatMetricValue(source[metric])}</em>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Sin ventas por origen" message="No hay ventas válidas para comparar en este periodo." />
      )}
    </section>
  );
}

function ModeSummary({ mode, statistics }) {
  const primaryDish = statistics.topDishes[0];
  const bestDay = [...statistics.salesByDay]
    .sort((left, right) => right.total - left.total || right.count - left.count)[0];
  const average = ticketAverage(statistics.sales.activeTotal, statistics.sales.activeCount);

  if (mode === 'month') {
    return (
      <section className="statistics-summary statistics-summary--month" aria-label="Resumen mensual">
        <SummaryCard icon={Wallet} label="Total vendido en el mes" value={formatCurrency(statistics.sales.activeTotal)} tone="orange" />
        <SummaryCard icon={TrendingUp} label="Ticket promedio" value={formatCurrency(average)} detail="Total vendido entre ventas válidas" />
        <SummaryCard icon={ClipboardList} label="Total de ventas" value={statistics.sales.activeCount.toLocaleString('es-MX')} />
        <SummaryCard icon={CalendarDays} label="Día con más ventas" value={bestDay?.total ? formatCompactDate(bestDay.date) : 'Sin datos'} detail={bestDay?.total ? `${formatCurrency(bestDay.total)} por importe` : null} tone="orange" />
        <SummaryCard icon={Utensils} label="Platillo más pedido" value={primaryDish?.name || 'Sin datos'} detail={primaryDish ? `${primaryDish.quantity} unidades` : null} tone="pink" />
      </section>
    );
  }

  return (
    <section className="statistics-summary" aria-label={mode === 'week' ? 'Resumen semanal' : 'Resumen del rango'}>
      <SummaryCard icon={Wallet} label={mode === 'week' ? 'Total vendido' : 'Total vendido'} value={formatCurrency(statistics.sales.activeTotal)} tone="orange" />
      <SummaryCard icon={TrendingUp} label="Cantidad de ventas" value={statistics.sales.activeCount.toLocaleString('es-MX')} detail="Filas válidas en VENTAS" />
      <SummaryCard icon={ClipboardList} label="Pedidos atendidos" value={statistics.orderStatuses.finalized.toLocaleString('es-MX')} detail="Pedidos finalizados" />
      <SummaryCard icon={Utensils} label="Platillo más pedido" value={primaryDish?.name || 'Sin datos'} detail={primaryDish ? `${primaryDish.quantity} unidades` : null} tone="pink" />
    </section>
  );
}

function StatisticsPanels({ mode, statistics }) {
  if (mode === 'month') {
    return (
      <section className="statistics-panels statistics-panels--month">
        <SalesLinePanel items={statistics.salesByDay} />
        <SalesSourcesChart sales={statistics.sales} title="Ventas por origen del mes" />
        <OrdersByWeekPanel items={statistics.ordersByWeek} />
        <TopDishesPanel items={statistics.topDishes} subtitle="Top basado en detalle compatible con ventas válidas." />
      </section>
    );
  }

  if (mode === 'range') {
    return (
      <section className="statistics-panels">
        <SalesBarsPanel
          title="Evolución de ventas en el rango"
          eyebrow="Agrupación automática"
          items={statistics.salesByPeriod}
          labelForItem={(item) => item.label}
        />
        <SalesSourcesChart sales={statistics.sales} title="Comparación por origen del rango" />
        <OrderStatusPanel statuses={statistics.orderStatuses} />
        <TopDishesPanel items={statistics.topDishes} subtitle="Excluye pedidos rechazados o cancelados." />
      </section>
    );
  }

  return (
    <section className="statistics-panels">
      <SalesBarsPanel
        title="Ventas de la semana"
        eyebrow="Ingresos"
        items={statistics.salesByDay}
        labelForItem={(item) => formatShortDate(item.date)}
      />
      <PeakHourPanel items={statistics.peakHoursByDay} />
      <SalesSourcesChart sales={statistics.sales} title="Comparación de origen de la semana" />
      <TopDishesPanel items={statistics.topDishes} />
      <OrderStatusPanel statuses={statistics.orderStatuses} />
    </section>
  );
}

export function AdminStatisticsPage() {
  const [mode, setMode] = useState('week');
  const [rangeDraft, setRangeDraft] = useState(createDefaultRange);
  const [appliedRange, setAppliedRange] = useState(createDefaultRange);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState('');
  const [rangeError, setRangeError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const period = useMemo(() => {
    if (mode === 'week') {
      return { from: getCurrentWeekStartIso(), to: null };
    }

    if (mode === 'month') {
      return { from: getCurrentMonthStartIso(), to: getCurrentMonthEndIso() };
    }

    return appliedRange;
  }, [mode, appliedRange]);

  useEffect(() => {
    let isMounted = true;

    async function loadStatistics() {
      setIsLoading(true);
      setError('');

      try {
        const result = mode === 'week'
          ? await getWeeklyStatistics(period.from)
          : await getRangeStatistics(period.from, period.to);

        if (isMounted) {
          setStatistics(result);
        }
      } catch (apiError) {
        if (isMounted) {
          setStatistics(null);
          setError(getApiMessage(apiError, 'No se pudieron consultar las estadísticas.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStatistics();

    return () => {
      isMounted = false;
    };
  }, [mode, period.from, period.to]);

  function handleModeChange(nextMode) {
    setRangeError('');
    setMode(nextMode);
  }

  function handleRangeSubmit(event) {
    event.preventDefault();

    if (!rangeDraft.from || !rangeDraft.to) {
      setRangeError('Selecciona la fecha de inicio y la fecha de fin.');
      return;
    }

    if (rangeDraft.from > rangeDraft.to) {
      setRangeError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    setRangeError('');
    setAppliedRange({ ...rangeDraft });
  }

  const periodLabel = statistics?.from && statistics?.to
    ? `${formatDate(statistics.from)} - ${formatDate(statistics.to)}`
    : 'Período seleccionado';

  return (
    <div className="statistics-page">
      <AdminWorkspaceSidebar activePath="/admin/dashboard" />

      <main className="statistics-page__main">
        <header className="statistics-header">
          <div>
            <p>Rendimiento</p>
            <h1 className="admin-page-header__title">Estadísticas</h1>
            <span>Resumen de ventas, pedidos y platillos por periodo.</span>
          </div>
          <div className="statistics-header__actions">
            <div className="statistics-tabs" role="group" aria-label="Período de estadísticas">
              {STATISTICS_MODES.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    type="button"
                    className={mode === item.id ? 'statistics-tabs__button statistics-tabs__button--active' : 'statistics-tabs__button'}
                    aria-pressed={mode === item.id}
                    onClick={() => handleModeChange(item.id)}
                    key={item.id}
                  >
                    {Icon ? <Icon size={17} strokeWidth={2} aria-hidden="true" /> : null}
                    {item.label}
                  </button>
                );
              })}
            </div>
            <AdminHeaderActions />
          </div>
        </header>

        {mode === 'range' ? (
          <form className="statistics-range" onSubmit={handleRangeSubmit}>
            <label>
              <span>Fecha inicio</span>
              <input
                type="date"
                value={rangeDraft.from}
                onChange={(event) => setRangeDraft((current) => ({ ...current, from: event.target.value }))}
              />
            </label>
            <label>
              <span>Fecha fin</span>
              <input
                type="date"
                value={rangeDraft.to}
                onChange={(event) => setRangeDraft((current) => ({ ...current, to: event.target.value }))}
              />
            </label>
            <button type="submit" disabled={isLoading}>Aplicar filtro</button>
            {rangeError ? <p className="statistics-range__error" role="alert">{rangeError}</p> : null}
          </form>
        ) : null}

        <div className="statistics-feedback">
          {isLoading ? <Loading label="Cargando estadísticas..." /> : null}
          <ErrorMessage message={error} />
        </div>

        {!isLoading && !error && statistics?.hasActivity ? (
          <>
            <p className="statistics-period"><CalendarDays size={17} aria-hidden="true" /> {periodLabel}</p>
            <ModeSummary mode={mode} statistics={statistics} />
            <StatisticsPanels mode={mode} statistics={statistics} />
          </>
        ) : null}

        {!isLoading && !error && statistics && !statistics.hasActivity ? (
          <EmptyState
            title="Sin actividad en este período"
            message="No se encontraron pedidos, ventas ni platillos vendidos para las fechas seleccionadas."
          />
        ) : null}
      </main>
    </div>
  );
}
