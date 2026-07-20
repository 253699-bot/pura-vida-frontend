<<<<<<< Updated upstream
import { useEffect, useState } from 'react';
import { getTodayMenu } from '../../entities/menu/menuApi.js';
import { MenuAvailabilityToggle } from '../../features/menu/update-availability/MenuAvailabilityToggle.jsx';
import { TodayMenuForm } from '../../features/menu/update-today-menu/TodayMenuForm.jsx';
import { TodayMenuList } from '../../features/menu/view-today-menu/TodayMenuList.jsx';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { Card } from '../../shared/ui/Card.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
=======
import { useCallback, useEffect, useState } from 'react';
import { Coffee, Leaf, Pencil, Plus, Store, Trash2, Utensils, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayBusinessStatus, updateTodayBusinessStatus } from '../../entities/business/businessApi.js';
import {
  deleteDish,
  getAdminDishes,
  getTodayMenu,
  updateTodayMenu,
} from '../../entities/menu/menuApi.js';
import { getAdminOrders } from '../../entities/orders/orderApi.js';
import {
  CreateDishDialog,
  DeleteDishDialog,
  DishCreatedDialog,
  EditDishDialog,
} from '../../features/menu/manage-dishes/DishDialogs.jsx';
import { MenuAvailabilityToggle } from '../../features/menu/update-availability/MenuAvailabilityToggle.jsx';
import { TodayMenuForm } from '../../features/menu/update-today-menu/TodayMenuForm.jsx';
import { TodayMenuList } from '../../features/menu/view-today-menu/TodayMenuList.jsx';
import { versionAssetUrl } from '../../shared/api/assets.js';
import { getApiErrors, getApiMessage } from '../../shared/api/apiResponse.js';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import { AdminHeaderActions } from './components/AdminHeaderActions.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';

import './AdminMenuPage.css';
import './components/AdminPageHeader.css';

const DISH_PRESENTATION = {
  platillo_fuerte: { label: 'Plato fuerte', icon: Utensils },
  bebida: { label: 'Bebida', icon: Coffee },
  complemento: { label: 'Complemento', icon: Leaf },
  postre: { label: 'Postre', icon: Utensils },
};

function CloseBusinessWarningDialog({ counts, isSubmitting, onCancel }) {
  const pending = Number(counts?.pending || 0);
  const accepted = Number(counts?.accepted || 0);
  const total = pending + accepted;

  return (
    <div className="dish-dialog-backdrop" role="presentation">
      <section className="dish-dialog dish-dialog--compact" role="dialog" aria-modal="true" aria-labelledby="close-business-warning-title">
        <header className="dish-dialog__header">
          <div>
            <p>Pedidos activos</p>
            <h2 id="close-business-warning-title">No puedes cerrar la fonda</h2>
          </div>
          <button type="button" onClick={onCancel} disabled={isSubmitting} aria-label="Cerrar"><X size={21} aria-hidden="true" /></button>
        </header>
        <div className="admin-close-warning">
          <p>No puedes cerrar la fonda mientras existan pedidos pendientes o aceptados.</p>
          {total > 0 ? (
            <dl>
              <div><dt>Pendientes</dt><dd>{pending}</dd></div>
              <div><dt>Aceptados sin finalizar</dt><dd>{accepted}</dd></div>
            </dl>
          ) : null}
          <div className="dish-dialog__actions">
            <Link className="button button--primary button--md" to="/admin/orders">Ir a pedidos</Link>
            <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function BusinessStatusCompactCard({ status, isLoading, loadError, onUpdated, onBeforeClose }) {
  const [selectedOpen, setSelectedOpen] = useState(true);
  const [motivoCierre, setMotivoCierre] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closeWarning, setCloseWarning] = useState(null);

  useEffect(() => {
    if (!status) return;
    setSelectedOpen(status.abierto !== false);
    setMotivoCierre(status.motivoCierre || '');
  }, [status]);

  const configured = Boolean(status?.configured);
  const isOpen = status?.abierto === true;
  const statusText = isOpen ? 'Abierta' : 'Cerrada';
  const helperText = !configured
    ? 'Aún no se ha configurado el estado de hoy.'
    : isOpen
      ? 'Tu fonda está abierta hoy y los clientes pueden realizar pedidos.'
      : status?.motivoCierre
        ? `Tu fonda está cerrada hoy: ${status.motivoCierre}`
        : 'Tu fonda está cerrada hoy y los clientes no pueden realizar pedidos.';

  function chooseStatus(nextOpen) {
    setSelectedOpen(nextOpen);
    setFieldErrors({});
    setError('');
    setSuccess('');
    setCloseWarning(null);
    if (nextOpen) {
      setMotivoCierre('');
    }
  }

  function closureCountsFromError(apiError) {
    if (apiError?.code !== 'ACTIVE_ORDERS_PREVENT_CLOSURE' && apiError?.httpStatus !== 409) {
      return null;
    }

    return {
      pending: Number(apiError?.errors?.pendientes || 0),
      accepted: Number(apiError?.errors?.aceptados || 0),
    };
  }

  async function submitStatus() {
    setError('');
    setFieldErrors({});
    setSuccess('');

    if (!selectedOpen && !motivoCierre.trim()) {
      setFieldErrors({ motivoCierre: 'Indica el motivo de cierre.' });
      return;
    }

    if (!selectedOpen) {
      setIsSubmitting(true);
      try {
        const counts = await onBeforeClose?.();
        if (counts && counts.pending + counts.accepted > 0) {
          setCloseWarning(counts);
          return;
        }
      } catch (apiError) {
        setError(getApiMessage(apiError, 'No se pudieron verificar los pedidos activos antes de cerrar.'));
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    setIsSubmitting(true);

    try {
      const updatedStatus = await updateTodayBusinessStatus({
        abierto: selectedOpen,
        motivoCierre: selectedOpen ? null : motivoCierre.trim(),
      });
      setSuccess('Estado actualizado.');
      setCloseWarning(null);
      onUpdated?.(updatedStatus);
    } catch (apiError) {
      const activeOrderCounts = closureCountsFromError(apiError);
      if (activeOrderCounts) {
        setCloseWarning(activeOrderCounts);
      }
      setError(getApiMessage(apiError, 'No se pudo actualizar el estado.'));
      setFieldErrors(getApiErrors(apiError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitStatus();
  }

  return (
    <section className="admin-status-card" aria-labelledby="admin-status-title">
      <div className="admin-status-card__summary">
        <span className="admin-status-card__icon" aria-hidden="true">
          <Store size={28} strokeWidth={1.8} />
        </span>
        <div>
          <div className="admin-status-card__title-row">
            <h2 id="admin-status-title">Estado de la fonda</h2>
            {!isLoading ? (
              <span className={`admin-status-card__badge ${isOpen ? 'admin-status-card__badge--open' : 'admin-status-card__badge--closed'}`}>
                {configured ? statusText : 'Sin configurar'}
              </span>
            ) : null}
          </div>
          {isLoading ? <Loading label="Cargando estado..." /> : <p>{helperText}</p>}
          <ErrorMessage message={loadError || error} />
          {success ? <div className="message message--success" role="status">{success}</div> : null}
        </div>
      </div>

      <form className="admin-status-card__controls" onSubmit={handleSubmit}>
        <span>CAMBIAR ESTADO</span>
        <div className="admin-status-segmented" role="group" aria-label="Cambiar estado de la fonda">
          <button
            type="button"
            className={selectedOpen ? 'admin-status-segmented__option is-active' : 'admin-status-segmented__option'}
            aria-pressed={selectedOpen}
            disabled={isSubmitting || isLoading}
            onClick={() => chooseStatus(true)}
          >
            Abierta
          </button>
          <button
            type="button"
            className={!selectedOpen ? 'admin-status-segmented__option is-active' : 'admin-status-segmented__option'}
            aria-pressed={!selectedOpen}
            disabled={isSubmitting || isLoading}
            onClick={() => chooseStatus(false)}
          >
            Cerrada
          </button>
        </div>
        {!selectedOpen ? (
          <label className="admin-status-card__reason" htmlFor="admin-status-reason">
            <span>Motivo de cierre</span>
            <textarea
              id="admin-status-reason"
              className="textarea"
              value={motivoCierre}
              onChange={(event) => setMotivoCierre(event.target.value)}
              disabled={isSubmitting}
            />
            {fieldErrors.motivoCierre ? <small>{fieldErrors.motivoCierre}</small> : null}
          </label>
        ) : null}
        <Button type="submit" size="sm" disabled={isSubmitting || isLoading}>
          {isSubmitting ? 'Guardando...' : 'Guardar estado'}
        </Button>
      </form>

      {closeWarning ? (
        <CloseBusinessWarningDialog
          counts={closeWarning}
          isSubmitting={isSubmitting}
          onCancel={() => setCloseWarning(null)}
        />
      ) : null}
    </section>
  );
}

function DishCard({ dish, onEdit, onDelete }) {
  const presentation = DISH_PRESENTATION[dish.tipoPlatillo] || DISH_PRESENTATION.platillo_fuerte;
  const Icon = presentation.icon;
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = versionAssetUrl(dish.imagenUrl, dish.actualizadoEn);
  const hasImage = Boolean(imageSrc) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  return (
    <article className="admin-dish-card">
      <span className={`admin-dish-card__visual ${hasImage ? 'admin-dish-card__visual--image' : ''}`} aria-hidden="true">
        {hasImage ? <img src={imageSrc} alt="" onError={() => setImageFailed(true)} /> : <Icon size={30} strokeWidth={1.8} />}
      </span>
      <div className="admin-dish-card__content">
        <div>
          <h3>{dish.nombre}</h3>
          <span className="admin-dish-card__id">ID: {dish.id}</span>
        </div>
        <span>{presentation.label}</span>
        <p>{dish.descripcion || 'Sin descripción.'}</p>
      </div>
      <strong className="admin-dish-card__price">{formatCurrency(dish.precioBase)}</strong>
      <div className="admin-dish-card__actions" aria-label={`Acciones para ${dish.nombre}`}>
        <Button variant="secondary" size="sm" onClick={() => onEdit(dish)}>
          <Pencil size={16} aria-hidden="true" />
          Editar
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(dish)}>
          <Trash2 size={16} aria-hidden="true" />
          Eliminar
        </Button>
      </div>
    </article>
  );
}
>>>>>>> Stashed changes

function RemoveMenuItemDialog({ item, isRemoving, error, onClose, onConfirm }) {
  return (
    <div className="dish-dialog-backdrop" role="presentation">
      <section className="dish-dialog dish-dialog--compact" role="dialog" aria-modal="true" aria-labelledby="remove-menu-item-title">
        <header className="dish-dialog__header">
          <div>
            <p>Menú del día</p>
            <h2 id="remove-menu-item-title">¿Quitar platillo?</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isRemoving} aria-label="Cerrar"><X size={21} aria-hidden="true" /></button>
        </header>
        <div className="admin-menu-remove-dialog">
          <p>{item.nombre} dejará de publicarse hoy, pero seguirá en el catálogo activo y podrá agregarse después.</p>
          <ErrorMessage message={error} />
          <div className="dish-dialog__actions">
            <Button variant="secondary" onClick={onClose} disabled={isRemoving}>Volver</Button>
            <Button variant="danger" onClick={onConfirm} disabled={isRemoving}>
              {isRemoving ? 'Quitando...' : 'Quitar del menú'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function menuPayloadFromIds(ids) {
  return { items: ids.map((platilloId) => ({ platilloId })) };
}

export function AdminMenuPage() {
  const [menu, setMenu] = useState(null);
<<<<<<< Updated upstream
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
=======
  const [businessStatus, setBusinessStatus] = useState(null);
  const [dishesError, setDishesError] = useState('');
  const [menuError, setMenuError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoadingDishes, setIsLoadingDishes] = useState(true);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createdDish, setCreatedDish] = useState(null);
  const [editingDish, setEditingDish] = useState(null);
  const [deletingDish, setDeletingDish] = useState(null);
  const [removingMenuItem, setRemovingMenuItem] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [removeMenuError, setRemoveMenuError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingMenuItem, setIsRemovingMenuItem] = useState(false);

  const loadDishes = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setIsLoadingDishes(true);
    setDishesError('');

    try {
      const activeDishes = await getAdminDishes();
      setDishes(activeDishes);
      return activeDishes;
    } catch (apiError) {
      setDishesError(getApiMessage(apiError, 'No se pudo consultar el catálogo de platillos.'));
      return null;
    } finally {
      if (showLoading) setIsLoadingDishes(false);
    }
  }, []);

  const loadMenu = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setIsLoadingMenu(true);
    setMenuError('');

    try {
      const todayMenu = await getTodayMenu();
      setMenu(todayMenu);
      return todayMenu;
    } catch (apiError) {
      setMenuError(getApiMessage(apiError, 'No se pudo consultar el menú de hoy.'));
      return null;
    } finally {
      if (showLoading) setIsLoadingMenu(false);
    }
  }, []);
>>>>>>> Stashed changes

  useEffect(() => {
    let isMounted = true;

<<<<<<< Updated upstream
    async function loadMenu() {
      try {
        const todayMenu = await getTodayMenu();

        if (isMounted) {
          setMenu(todayMenu);
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiMessage(apiError, 'No se pudo consultar el menu de hoy.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
=======
    async function loadPage() {
      const [dishesResult, menuResult, statusResult] = await Promise.allSettled([
        getAdminDishes(),
        getTodayMenu(),
        getTodayBusinessStatus(),
      ]);

      if (!isMounted) return;

      if (dishesResult.status === 'fulfilled') {
        setDishes(dishesResult.value);
      } else {
        setDishesError(getApiMessage(dishesResult.reason, 'No se pudo consultar el catálogo de platillos.'));
      }

      if (menuResult.status === 'fulfilled') {
        setMenu(menuResult.value);
      } else {
        setMenuError(getApiMessage(menuResult.reason, 'No se pudo consultar el menú de hoy.'));
      }

      if (statusResult.status === 'fulfilled') {
        setBusinessStatus(statusResult.value);
      } else {
        setStatusError(getApiMessage(statusResult.reason, 'No se pudo consultar el estado de la fonda.'));
      }

      setIsLoadingDishes(false);
      setIsLoadingMenu(false);
      setIsLoadingStatus(false);
>>>>>>> Stashed changes
    }

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, []);

<<<<<<< Updated upstream
=======
  async function getActiveOrderCounts() {
    const [pendingOrders, acceptedOrders] = await Promise.all([
      getAdminOrders({ estado: 'pendiente', currentCycleOnly: true }),
      getAdminOrders({ estado: 'aceptado', currentCycleOnly: true }),
    ]);

    return { pending: pendingOrders.length, accepted: acceptedOrders.length };
  }

  async function handleDishCreated(dish) {
    setIsCreateOpen(false);
    setSuccessMessage('');
    setDishes((currentDishes) => {
      if (!dish?.id) return currentDishes;
      const exists = currentDishes.some((currentDish) => currentDish.id === dish.id);
      return exists
        ? currentDishes.map((currentDish) => (currentDish.id === dish.id ? dish : currentDish))
        : [dish, ...currentDishes];
    });
    setCreatedDish(dish);
  }

  async function handleDishUpdated(updatedDish) {
    if (updatedDish?.id) {
      setDishes((currentDishes) => currentDishes.map((dish) => (
        dish.id === updatedDish.id ? updatedDish : dish
      )));
    }

    const refreshedMenu = await loadMenu();
    if (updatedDish?.id && refreshedMenu) {
      setMenu((currentMenu) => {
        const sourceMenu = currentMenu || refreshedMenu;

        return {
          ...sourceMenu,
          items: sourceMenu.items.map((item) => (
            item.platilloId === updatedDish.id
              ? {
                ...item,
                imagenUrl: updatedDish.imagenUrl,
                imagenVersion: updatedDish.actualizadoEn,
              }
              : item
          )),
        };
      });
    }

    setSuccessMessage('Platillo actualizado.');
  }

  function handleRequestDelete(dish) {
    setDeleteError('');
    setDeletingDish(dish);
  }

  async function handleConfirmDelete() {
    if (!deletingDish) return;

    setDeleteError('');
    setIsDeleting(true);

    try {
      await deleteDish(deletingDish.id);
      const deletedName = deletingDish.nombre;
      setDeletingDish(null);
      await Promise.all([loadDishes(), loadMenu()]);
      setSuccessMessage(`${deletedName} dejó de estar disponible y permanece en el historial.`);
    } catch (apiError) {
      setDeleteError(getApiMessage(apiError, 'No se pudo eliminar el platillo.'));

      if (apiError?.httpStatus === 409) {
        await loadDishes();
      }
    } finally {
      setIsDeleting(false);
    }
  }

  function handleRequestRemoveMenuItem(item) {
    setRemoveMenuError('');
    setRemovingMenuItem(item);
  }

  async function handleConfirmRemoveMenuItem() {
    if (!removingMenuItem || !menu) return;

    const nextDishIds = (menu.items || [])
      .filter((item) => item.id !== removingMenuItem.id)
      .map((item) => item.platilloId)
      .filter((id) => Number.isInteger(id) && id > 0);

    setIsRemovingMenuItem(true);
    setRemoveMenuError('');

    try {
      const updatedMenu = await updateTodayMenu(menuPayloadFromIds(nextDishIds));
      setMenu(updatedMenu);
      setRemovingMenuItem(null);
      setSuccessMessage(`${removingMenuItem.nombre} se quitó del menú publicado de hoy.`);
    } catch (apiError) {
      setRemoveMenuError(getApiMessage(apiError, 'No se pudo quitar el platillo del menú.'));
    } finally {
      setIsRemovingMenuItem(false);
    }
  }

>>>>>>> Stashed changes
  function handleItemUpdated(updatedItem) {
    setMenu((currentMenu) => {
      if (!currentMenu) return currentMenu;

      return {
        ...currentMenu,
        items: currentMenu.items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      };
    });
  }

  return (
<<<<<<< Updated upstream
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">Menu del dia</h1>
        <p className="page__subtitle">Configura el menu y cambia disponibilidad de platillos.</p>
      </header>
      {isLoading ? <Loading label="Cargando menu..." /> : null}
      <ErrorMessage message={error} />
      <div className="section-grid">
        <Card>
          <div className="stack">
            <div>
              <h2 className="card__title">Configurar platillos</h2>
              <p className="card__meta">
                Temporal hasta implementar catalogo de platillos: captura IDs separados por coma.
              </p>
=======
    <div className="admin-menu-layout">
      <AdminWorkspaceSidebar activePath="/admin/menu" />

      <main className="admin-menu-page">
        <header className="admin-menu-header">
          <div className="admin-menu-header__title">
            <div>
              <p className="admin-menu-header__eyebrow">Menú y catálogo</p>
              <h1 className="admin-page-header__title">Administración de platillos</h1>
              <span>Crea platillos, consulta el catálogo activo y configura el menú del día.</span>
>>>>>>> Stashed changes
            </div>
            <TodayMenuForm onUpdated={setMenu} />
          </div>
<<<<<<< Updated upstream
        </Card>
        <div className="stack">
          {menu ? (
            <TodayMenuList
              menu={menu}
              renderActions={(item) => (
                <MenuAvailabilityToggle item={item} onUpdated={handleItemUpdated} />
              )}
            />
          ) : null}
        </div>
      </div>
    </main>
=======
          <AdminHeaderActions />
        </header>

        <div className="admin-menu-page__content">
          <ErrorMessage message={dishesError} />
          {successMessage ? <div className="message message--success" role="status">{successMessage}</div> : null}

          <BusinessStatusCompactCard
            status={businessStatus}
            isLoading={isLoadingStatus}
            loadError={statusError}
            onUpdated={setBusinessStatus}
            onBeforeClose={getActiveOrderCounts}
          />

          <section className="admin-menu-management-header" aria-labelledby="admin-today-menu-title">
            <div>
              <h2 id="admin-today-menu-title">Menú del día</h2>
              <p>Administra los platillos de tu menú publicado de hoy.</p>
            </div>
            <Button onClick={() => {
              setSuccessMessage('');
              setIsCreateOpen(true);
            }}>
              <Plus size={18} aria-hidden="true" />
              Agregar platillo
            </Button>
          </section>

          <section className="admin-dishes" aria-labelledby="admin-dishes-title">
            <div className="admin-dishes__heading">
              <div>
                <h2 id="admin-dishes-title">Catálogo activo</h2>
                <p>Los platillos eliminados se conservan en el historial y dejan de aparecer aquí.</p>
              </div>
              {!isLoadingDishes && !dishesError ? <span>{dishes.length} activos</span> : null}
            </div>

            {isLoadingDishes ? <Loading label="Cargando platillos..." /> : null}
            {!isLoadingDishes && !dishesError && dishes.length === 0 ? (
              <EmptyState title="No hay platillos activos" message="Agrega el primer platillo para comenzar el catálogo." />
            ) : null}
            {!isLoadingDishes && dishes.length > 0 ? (
              <div className="admin-dishes__list">
                {dishes.map((dish) => (
                  <DishCard dish={dish} onEdit={setEditingDish} onDelete={handleRequestDelete} key={dish.id} />
                ))}
              </div>
            ) : null}
          </section>

          <section className="admin-today-menu" aria-label="Administrar menú publicado de hoy">
            {isLoadingMenu ? <Loading label="Cargando menú de hoy..." /> : null}
            <ErrorMessage message={menuError} />
            {!isLoadingMenu ? (
              <div className="admin-today-menu__grid">
                <div className="admin-today-menu__panel">
                  <div>
                    <h3>Configurar platillos publicados</h3>
                    <p>Captura los IDs visibles en el catálogo.</p>
                  </div>
                  <TodayMenuForm currentMenu={menu} onUpdated={setMenu} />
                </div>
                <div className="stack">
                  {menu ? (
                    <TodayMenuList
                      menu={menu}
                      renderActions={(item) => (
                        <div className="admin-today-menu-actions">
                          <MenuAvailabilityToggle item={item} onUpdated={handleItemUpdated} />
                          <Button variant="danger" size="sm" onClick={() => handleRequestRemoveMenuItem(item)} disabled={isRemovingMenuItem}>
                            <Trash2 size={16} aria-hidden="true" />
                            Quitar
                          </Button>
                        </div>
                      )}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        {isCreateOpen ? (
          <CreateDishDialog onClose={() => setIsCreateOpen(false)} onCreated={handleDishCreated} />
        ) : null}
        {createdDish ? <DishCreatedDialog dish={createdDish} onClose={() => setCreatedDish(null)} /> : null}
        {editingDish ? (
          <EditDishDialog
            dish={editingDish}
            onClose={() => setEditingDish(null)}
            onUpdated={handleDishUpdated}
          />
        ) : null}
        {deletingDish ? (
          <DeleteDishDialog
            dish={deletingDish}
            isDeleting={isDeleting}
            error={deleteError}
            onClose={() => {
              setDeleteError('');
              setDeletingDish(null);
            }}
            onConfirm={handleConfirmDelete}
          />
        ) : null}
        {removingMenuItem ? (
          <RemoveMenuItemDialog
            item={removingMenuItem}
            isRemoving={isRemovingMenuItem}
            error={removeMenuError}
            onClose={() => {
              setRemoveMenuError('');
              setRemovingMenuItem(null);
            }}
            onConfirm={handleConfirmRemoveMenuItem}
          />
        ) : null}
      </main>
    </div>
>>>>>>> Stashed changes
  );
}
