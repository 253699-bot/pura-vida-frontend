import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  ChefHat,
  Coffee,
  FileText,
  House,
  Leaf,
  Pencil,
  Plus,
  ShoppingCart,
  Store,
  Trash2,
  Utensils,
  Wallet,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayBusinessStatus, updateTodayBusinessStatus } from '../../entities/business/businessApi.js';
import { getTodayMenu, updateMenuItemAvailability } from '../../entities/menu/menuApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import brandLogo from '../../shared/assets/brand/pura-vida-logo.svg';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { formatDate } from '../../shared/utils/date.js';
import { formatCurrency } from '../../shared/utils/currency.js';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import './DailyManagementPage.css';

const SIDE_NAVIGATION = [
  { icon: House, label: 'Dashboard', to: '/admin' },
  { icon: ShoppingCart, label: 'Órdenes', disabled: true },
  { icon: Utensils, label: 'Menú diario', active: true },
  { icon: BarChart3, label: 'Estadísticas', to: '/admin/statistics' },
  { icon: FileText, label: 'Reporte semanal', to: '/admin/reports/weekly' },
  { icon: Wallet, label: 'Ventas manuales', to: '/admin/sales/manual' },
];

const MENU_ITEM_VISUALS = {
  platillo_fuerte: { icon: Utensils, label: 'Plato fuerte' },
  bebida: { icon: Coffee, label: 'Bebida' },
  complemento: { icon: Leaf, label: 'Acompañamiento' },
  postre: { icon: ChefHat, label: 'Postre' },
};

function getStatusPresentation(status) {
  if (!status?.configured || status.abierto === null) {
    return {
      label: 'Sin configurar',
      description: 'Define el estado de hoy para que las personas conozcan la disponibilidad.',
      tone: 'neutral',
    };
  }

  return status.abierto
    ? {
        label: 'Abierta',
        description: 'Tu fonda está abierta hoy y las personas pueden consultar el menú disponible.',
        tone: 'open',
      }
    : {
        label: 'Cerrada',
        description: status.motivoCierre || 'La fonda no está atendiendo hoy.',
        tone: 'closed',
      };
}

function DailyMenuRow({ item, isUpdating, onToggle }) {
  const visual = MENU_ITEM_VISUALS[item.tipoPlatillo] || MENU_ITEM_VISUALS.platillo_fuerte;
  const Icon = visual.icon;

  return (
    <article className={`daily-menu-row ${item.disponible ? '' : 'daily-menu-row--unavailable'}`.trim()}>
      <span className="daily-menu-row__visual" aria-hidden="true">
        <Icon size={26} strokeWidth={1.9} />
      </span>
      <div className="daily-menu-row__details">
        <h3>{item.nombre}</h3>
        <p>{item.descripcion || visual.label}</p>
      </div>
      <strong className="daily-menu-row__price">{formatCurrency(item.precio)}</strong>
      <div className="daily-menu-row__availability">
        <span>Disponibilidad</span>
        <button
          type="button"
          className="daily-availability-switch"
          role="switch"
          aria-checked={item.disponible}
          aria-label={`${item.nombre}: ${item.disponible ? 'disponible' : 'no disponible'}`}
          onClick={() => onToggle(item)}
          disabled={isUpdating || !item.id}
        >
          <span className="daily-availability-switch__track" aria-hidden="true">
            <span className="daily-availability-switch__thumb" />
          </span>
          <span className={item.disponible ? 'daily-availability-switch__label' : 'daily-availability-switch__label daily-availability-switch__label--unavailable'}>
            {isUpdating ? 'Actualizando...' : item.disponible ? 'Disponible' : 'No disponible'}
          </span>
        </button>
      </div>
      <div className="daily-menu-row__actions" aria-label={`Acciones para ${item.nombre}`}>
        <button type="button" disabled aria-label="Editar platillo próximamente" title="Próximamente">
          <Pencil size={18} strokeWidth={2} aria-hidden="true" />
        </button>
        <button type="button" disabled aria-label="Eliminar platillo próximamente" title="Próximamente">
          <Trash2 size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export function DailyManagementPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [menu, setMenu] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [menuError, setMenuError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [isCloseEditorOpen, setIsCloseEditorOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');

  const statusPresentation = useMemo(() => getStatusPresentation(status), [status]);

  useEffect(() => {
    let isMounted = true;

    async function loadDailyManagement() {
      const [statusResult, menuResult] = await Promise.allSettled([
        getTodayBusinessStatus(),
        getTodayMenu(),
      ]);

      if (!isMounted) {
        return;
      }

      if (statusResult.status === 'fulfilled') {
        setStatus(statusResult.value);
      } else {
        setStatusError(getApiMessage(statusResult.reason, 'No se pudo consultar el estado de hoy.'));
      }

      if (menuResult.status === 'fulfilled') {
        setMenu(menuResult.value);
      } else {
        setMenuError(getApiMessage(menuResult.reason, 'No se pudo consultar el menú de hoy.'));
      }

      setIsLoading(false);
    }

    loadDailyManagement();

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveStatus(payload, success) {
    setActionError('');
    setSuccessMessage('');
    setIsUpdatingStatus(true);

    try {
      const updatedStatus = await updateTodayBusinessStatus(payload);
      setStatus(updatedStatus);
      setSuccessMessage(success);
      setIsCloseEditorOpen(false);
      setCloseReason('');
    } catch (apiError) {
      setActionError(getApiMessage(apiError, 'No se pudo actualizar el estado de la fonda.'));
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  function handleOpenBusiness() {
    if (status?.abierto === true && status.configured) {
      return;
    }

    saveStatus({ abierto: true, motivoCierre: null }, 'La fonda quedó abierta para hoy.');
  }

  function handleRequestClose() {
    setActionError('');
    setSuccessMessage('');
    setCloseReason(status?.motivoCierre || '');
    setIsCloseEditorOpen(true);
  }

  function handleCloseBusiness(event) {
    event.preventDefault();

    if (!closeReason.trim()) {
      setActionError('Indica el motivo de cierre antes de guardar el estado.');
      return;
    }

    saveStatus(
      { abierto: false, motivoCierre: closeReason.trim() },
      'La fonda quedó cerrada para hoy.',
    );
  }

  async function handleAvailabilityToggle(item) {
    setActionError('');
    setSuccessMessage('');
    setUpdatingItemId(item.id);

    try {
      const updatedItem = await updateMenuItemAvailability(item.id, {
        disponible: !item.disponible,
      });
      setMenu((currentMenu) => {
        if (!currentMenu) {
          return currentMenu;
        }

        return {
          ...currentMenu,
          items: currentMenu.items.map((currentItem) =>
            currentItem.id === updatedItem.id ? updatedItem : currentItem,
          ),
        };
      });
      setSuccessMessage(`Disponibilidad actualizada para ${updatedItem.nombre}.`);
    } catch (apiError) {
      setActionError(getApiMessage(apiError, 'No se pudo actualizar la disponibilidad.'));
    } finally {
      setUpdatingItemId(null);
    }
  }

  return (
    <div className="daily-management">
      <aside className="daily-sidebar" aria-label="Navegación administrativa">
        <Link className="daily-sidebar__brand" to="/" aria-label="PuraVida inicio">
          <img src={brandLogo} alt="PuraVida" />
        </Link>
        <nav className="daily-sidebar__nav">
          {SIDE_NAVIGATION.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <button
                  type="button"
                  className="daily-sidebar__item daily-sidebar__item--disabled"
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
                className={`daily-sidebar__item ${item.active ? 'daily-sidebar__item--active' : ''}`.trim()}
                to={item.to || '/admin/gestion-dia'}
                key={item.label}
              >
                <Icon size={21} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="daily-sidebar__user">
          <span className="daily-sidebar__avatar" aria-hidden="true">
            {(user?.nombre || user?.correo || 'E').slice(0, 1).toUpperCase()}
          </span>
          <span>
            <strong>{user?.nombre || 'Encargada'}</strong>
            <small>Encargada</small>
          </span>
        </div>
      </aside>

      <main className="daily-management__main">
        <header className="daily-management__header">
          <p className="daily-management__eyebrow">Operación diaria</p>
          <h1>Gestión del día</h1>
          <p>Administra la operación diaria de tu fonda y el menú disponible para hoy.</p>
        </header>

        {isLoading ? <Loading label="Cargando gestión del día..." /> : null}
        <ErrorMessage message={statusError} />
        <ErrorMessage message={menuError} />
        <ErrorMessage message={actionError} />
        {successMessage ? <div className="message message--success">{successMessage}</div> : null}

        {!isLoading && status ? (
          <section className="daily-status" aria-labelledby="daily-status-title">
            <div className="daily-status__summary">
              <span className={`daily-status__icon daily-status__icon--${statusPresentation.tone}`} aria-hidden="true">
                <Store size={31} strokeWidth={2} />
              </span>
              <div>
                <div className="daily-status__heading">
                  <h2 id="daily-status-title">Estado de la fonda</h2>
                  <span className={`daily-status__badge daily-status__badge--${statusPresentation.tone}`}>
                    {statusPresentation.label}
                  </span>
                </div>
                <p>{statusPresentation.description}</p>
                {status.fecha ? <small>{formatDate(status.fecha)}</small> : null}
              </div>
            </div>
            <div className="daily-status__controls">
              <span>Cambiar estado</span>
              <div className="daily-status__buttons">
                <button
                  type="button"
                  className={statusPresentation.tone === 'open' ? 'daily-status__button daily-status__button--active' : 'daily-status__button'}
                  onClick={handleOpenBusiness}
                  disabled={isUpdatingStatus || statusPresentation.tone === 'open'}
                >
                  <Store size={17} strokeWidth={2} aria-hidden="true" />
                  Abierta
                </button>
                <button
                  type="button"
                  className={statusPresentation.tone === 'closed' ? 'daily-status__button daily-status__button--active daily-status__button--closed' : 'daily-status__button'}
                  onClick={handleRequestClose}
                  disabled={isUpdatingStatus}
                >
                  <X size={17} strokeWidth={2} aria-hidden="true" />
                  Cerrada
                </button>
              </div>
            </div>
            {isCloseEditorOpen ? (
              <form className="daily-status__close-form" onSubmit={handleCloseBusiness}>
                <label htmlFor="daily-close-reason">Motivo de cierre</label>
                <input
                  id="daily-close-reason"
                  className="input"
                  value={closeReason}
                  onChange={(event) => setCloseReason(event.target.value)}
                  placeholder="Ej. Mantenimiento o descanso semanal"
                  disabled={isUpdatingStatus}
                  autoFocus
                />
                <div>
                  <button type="button" className="button button--secondary" onClick={() => setIsCloseEditorOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="button button--danger" disabled={isUpdatingStatus}>
                    {isUpdatingStatus ? 'Guardando...' : 'Confirmar cierre'}
                  </button>
                </div>
              </form>
            ) : null}
          </section>
        ) : null}

        {!isLoading ? (
          <section className="daily-menu" aria-labelledby="daily-menu-title">
            <header className="daily-menu__header">
              <div>
                <h2 id="daily-menu-title">Menú del día</h2>
                <p>Administra los platillos disponibles para hoy.</p>
              </div>
              <Link className="daily-menu__configure" to="/admin/menu">
                <Plus size={20} strokeWidth={2} aria-hidden="true" />
                Configurar menú
              </Link>
            </header>

            {!menuError && menu && !menu.configured ? (
              <EmptyState
                title="Menú no configurado"
                message="Configura los IDs de platillos para publicar el menú de hoy."
              />
            ) : null}
            {!menuError && menu?.configured && !menu.items.length ? (
              <EmptyState title="Sin platillos" message="El menú de hoy no tiene platillos cargados." />
            ) : null}
            {!menuError && menu?.configured && menu.items.length ? (
              <div className="daily-menu__list">
                {menu.items.map((item) => (
                  <DailyMenuRow
                    item={item}
                    isUpdating={updatingItemId === item.id}
                    onToggle={handleAvailabilityToggle}
                    key={item.id || item.platilloId}
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <p className="daily-management__notice">
          Los cambios de disponibilidad se reflejan inmediatamente en el menú público para tus
          clientes.
        </p>
      </main>
    </div>
  );
}
