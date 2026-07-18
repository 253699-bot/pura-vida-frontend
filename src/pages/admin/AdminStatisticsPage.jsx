import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  FileText,
  House,
  ShoppingCart,
  Utensils,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getRangeStatistics,
  getWeeklyStatistics,
} from '../../entities/statistics/statisticsApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import brandLogo from '../../shared/assets/brand/pura-vida-logo.svg';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import { formatDate } from '../../shared/utils/date.js';
import './AdminStatisticsPage.css';

const STATISTICS_MODES = [
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'range', label: 'Rango', icon: CalendarDays },
];

const STATISTICS_NAVIGATION = [
  { icon: House, label: 'Dashboard', to: '/admin' },
  { icon: ShoppingCart, label: 'Órdenes', disabled: true },
  { icon: Utensils, label: 'Menú diario', to: '/admin/gestion-dia' },
  { icon: BarChart3, label: 'Estadísticas', to: '/admin/statistics', active: true },
  { icon: FileText, label: 'Reporte semanal', to: '/admin/reports/weekly' },
  { icon: Wallet, label: 'Ventas manuales', to: '/admin/sales/manual' },
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

function TopDishesPanel({ items }) {
  const maximum = Math.max(...items.map((item) => item.quantity), 0);

  return (
    <section className="statistics-panel" aria-labelledby="top-dishes-title">
      <div className="statistics-panel__header">
        <div>
          <p>Preferencias</p>
          <h2 id="top-dishes-title">Platillos más vendidos</h2>
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

function OrderStatusPanel({ orders }) {
  const items = [
    { label: 'Pendientes', value: orders.pending, tone: 'warning' },
    { label: 'Aceptados', value: orders.accepted, tone: 'success' },
    { label: 'Rechazados', value: orders.rejected, tone: 'error' },
  ];
  const maximum = Math.max(...items.map((item) => item.value), 0);

  return (
    <section className="statistics-panel" aria-labelledby="order-status-title">
      <div className="statistics-panel__header">
        <div>
          <p>Operación</p>
          <h2 id="order-status-title">Estado de pedidos</h2>
        </div>
      </div>
      <div className="statistics-order-chart" aria-label="Distribución de pedidos por estado">
        {items.map((item) => (
          <div className="statistics-order-chart__item" key={item.label}>
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

export function AdminStatisticsPage() {
  const { user } = useAuth();
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
      return { from: getCurrentMonthStartIso(), to: getTodayIso() };
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

  const primaryDish = statistics?.topDishes?.[0];
  const periodLabel = statistics?.from && statistics?.to
    ? `${formatDate(statistics.from)} — ${formatDate(statistics.to)}`
    : 'Periodo seleccionado';

  return (
    <div className="statistics-page">
      <aside className="statistics-sidebar" aria-label="Navegación administrativa">
        <Link className="statistics-sidebar__brand" to="/" aria-label="PuraVida inicio">
          <img src={brandLogo} alt="PuraVida" />
        </Link>
        <nav className="statistics-sidebar__nav">
          {STATISTICS_NAVIGATION.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <button
                  type="button"
                  className="statistics-sidebar__item statistics-sidebar__item--disabled"
                  disabled
                  title="Próximamente"
                  key={item.label}
                >
                  <Icon size={21} strokeWidth={2} aria-hidden="true" />
                  {item.label}
                </button>
              );
            }

            return (
              <Link
                className={`statistics-sidebar__item ${item.active ? 'statistics-sidebar__item--active' : ''}`.trim()}
                to={item.to}
                key={item.label}
              >
                <Icon size={21} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="statistics-sidebar__user">
          <span className="statistics-sidebar__avatar" aria-hidden="true">
            {(user?.nombre || user?.correo || 'E').slice(0, 1).toUpperCase()}
          </span>
          <span>
            <strong>{user?.nombre || 'Encargada'}</strong>
            <small>Encargada</small>
          </span>
        </div>
      </aside>

      <main className="statistics-page__main">
        <div className="statistics-page__utility">
          <Link to="/notificaciones" aria-label="Abrir notificaciones" title="Notificaciones">
            <Bell size={21} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <header className="statistics-header">
          <div>
            <p>Rendimiento</p>
            <h1>Estadísticas</h1>
            <span>Resumen de ventas, pedidos y platillos por periodo.</span>
          </div>
          <div className="statistics-tabs" role="group" aria-label="Periodo de estadísticas">
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
            <section className="statistics-summary" aria-label="Resumen del periodo">
              <SummaryCard
                icon={ClipboardList}
                label="Total de pedidos"
                value={statistics.orders.total.toLocaleString('es-MX')}
                detail={`${statistics.sales.activeCount} ventas activas`}
              />
              <SummaryCard
                icon={Wallet}
                label="Ingresos activos"
                value={formatCurrency(statistics.sales.activeTotal)}
                detail={`${statistics.sales.cancelledCount} ventas anuladas`}
                tone="orange"
              />
              <SummaryCard
                icon={Utensils}
                label="Platillo más pedido"
                value={primaryDish?.name || 'Sin datos'}
                detail={primaryDish ? `${primaryDish.quantity} unidades` : null}
                tone="pink"
              />
            </section>

            <section className="statistics-panels">
              <TopDishesPanel items={statistics.topDishes} />
              <OrderStatusPanel orders={statistics.orders} />
            </section>

            <section className="statistics-sources" aria-labelledby="sales-source-title">
              <div>
                <p>Canales</p>
                <h2 id="sales-source-title">Origen de ventas activas</h2>
              </div>
              <article>
                <span>En fonda</span>
                <strong>{statistics.sales.manual.count}</strong>
                <small>{formatCurrency(statistics.sales.manual.total)}</small>
              </article>
              <article>
                <span>Desde la app</span>
                <strong>{statistics.sales.remote.count}</strong>
                <small>{formatCurrency(statistics.sales.remote.total)}</small>
              </article>
            </section>
          </>
        ) : null}

        {!isLoading && !error && statistics && !statistics.hasActivity ? (
          <EmptyState
            title="Sin actividad en este periodo"
            message="No se encontraron pedidos, ventas ni platillos vendidos para las fechas seleccionadas."
          />
        ) : null}
      </main>
    </div>
  );
}
