import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Store, Trash2, Utensils, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getTodayBusinessStatus,
  updateTodayBusinessStatus
} from '../../entities/business/businessApi.js';
import {
  deleteDish,
  getAdminDishes,
  getTodayMenu,
  updateTodayMenu
} from '../../entities/menu/menuApi.js';
import { getAdminOrders } from '../../entities/orders/orderApi.js';
import { CreateDishDialog, EditDishDialog } from '../../features/menu/manage-dishes/DishDialogs.jsx';
import { MenuAvailabilityToggle } from '../../features/menu/update-availability/MenuAvailabilityToggle.jsx';
import { TodayMenuForm } from '../../features/menu/update-today-menu/TodayMenuForm.jsx';
import { TodayMenuList } from '../../features/menu/view-today-menu/TodayMenuList.jsx';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import { AdminHeaderActions } from './components/AdminHeaderActions.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';
import './AdminMenuPage.css';
import './components/AdminPageHeader.css';

function versionAssetUrl(url, version) {
  if (!url || !version) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

function closureCountsFromError(error) {
  const details = error?.response?.data?.details;
  const pending = Number(details?.pendientes ?? details?.pending ?? details?.pedidosPendientes ?? 0);
  const accepted = Number(details?.aceptados ?? details?.accepted ?? details?.pedidosAceptados ?? 0);
  return { pending, accepted };
}

function CloseBusinessWarningDialog({ counts, onClose }) {
  if (!counts) {
    return null;
  }

  return (
    <div className="dish-dialog-backdrop" role="presentation">
      <section className="dish-dialog dish-dialog--compact" role="dialog" aria-modal="true" aria-labelledby="close-warning-title">
        <header className="dish-dialog__header">
          <div>
            <p>Pedidos activos</p>
            <h2 id="close-warning-title">No puedes cerrar la fonda todavía</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar aviso">
            <X aria-hidden="true" size={20} />
          </button>
        </header>
        <div className="dish-dialog-result dish-dialog-result--danger admin-menu-remove-dialog">
          <p>No puedes cerrar la fonda mientras existan pedidos pendientes o aceptados.</p>
          <p>
            Pendientes: {counts.pending}. Aceptados: {counts.accepted}.
          </p>
          <div className="dish-dialog-result__actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Entendido
            </Button>
            <Link className="button button--primary button--md" to="/admin/orders" onClick={onClose}>
              Ir a pedidos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function BusinessStatusCompactCard({ status, loading, error, onUpdated }) {
  const [selectedOpen, setSelectedOpen] = useState(Boolean(status?.abierto));
  const [reason, setReason] = useState(status?.motivoCierre ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [closeWarning, setCloseWarning] = useState(null);

  useEffect(() => {
    setSelectedOpen(Boolean(status?.abierto));
    setReason(status?.motivoCierre ?? '');
    setLocalError('');
    setSuccessMessage('');
  }, [status]);

  const helperText = selectedOpen
    ? 'Tu fonda está abierta hoy y los clientes pueden realizar pedidos.'
    : status?.motivoCierre
      ? `Tu fonda está cerrada. Motivo: ${status.motivoCierre}`
      : 'Tu fonda está cerrada y los clientes no pueden realizar pedidos.';

  async function submitStatus() {
    setLocalError('');
    setSuccessMessage('');
    setCloseWarning(null);

    if (!selectedOpen && !reason.trim()) {
      setLocalError('Escribe el motivo de cierre antes de guardar.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!selectedOpen) {
        const activeOrders = await getAdminOrders({ currentCycleOnly: true });
        const pending = activeOrders.filter((order) => order.estado === 'pendiente').length;
        const accepted = activeOrders.filter((order) => order.estado === 'aceptado').length;
        if (pending || accepted) {
          setCloseWarning({ pending, accepted });
          return;
        }
      }

      const updated = await updateTodayBusinessStatus({
        abierto: selectedOpen,
        motivoCierre: selectedOpen ? null : reason.trim()
      });
      onUpdated(updated);
      setReason(updated.motivoCierre ?? '');
      const nextOpen = Boolean(updated?.abierto ?? selectedOpen);
      setSuccessMessage(nextOpen ? 'La fonda se abrió correctamente.' : 'La fonda se cerró correctamente.');
    } catch (err) {
      const counts = closureCountsFromError(err);
      if (counts.pending || counts.accepted) {
        setCloseWarning(counts);
        return;
      }
      const fieldMessage = err?.errors?.motivoCierre || err?.data?.errors?.motivoCierre;
      setLocalError(fieldMessage || getApiMessage(err, 'No se pudo actualizar el estado de la fonda.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <Loading message="Consultando estado de la fonda..." />;
  }

  return (
    <>
      <section className="admin-status-card" aria-labelledby="business-status-title">
        <div className="admin-status-card__summary">
          <span className="admin-status-card__icon" aria-hidden="true">
            <Store size={28} />
          </span>
          <div>
            <div className="admin-status-card__title-row">
              <h2 id="business-status-title">Estado de la fonda</h2>
              <span className={`admin-status-card__badge admin-status-card__badge--${selectedOpen ? 'open' : 'closed'}`}>
                {selectedOpen ? 'Abierta' : 'Cerrada'}
              </span>
            </div>
            <p>{helperText}</p>
          </div>
        </div>

        <div className="admin-status-card__controls">
          <span>CAMBIAR ESTADO</span>
          <div className="admin-status-segmented" role="group" aria-label="Estado de la fonda">
            <button
              type="button"
              className={`admin-status-segmented__option ${selectedOpen ? 'is-active' : ''}`}
              onClick={() => {
                setSelectedOpen(true);
                setReason('');
                setLocalError('');
                setSuccessMessage('');
              }}
              disabled={isSubmitting}
            >
              Abierta
            </button>
            <button
              type="button"
              className={`admin-status-segmented__option ${!selectedOpen ? 'is-active' : ''}`}
              onClick={() => {
                setSelectedOpen(false);
                setSuccessMessage('');
              }}
              disabled={isSubmitting}
            >
              Cerrada
            </button>
          </div>
          {!selectedOpen ? (
            <label className="admin-status-card__reason">
              <span>Motivo de cierre</span>
              <textarea
                className="textarea"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Ej. Se agotaron los platillos disponibles"
                rows={3}
                disabled={isSubmitting}
              />
              {localError ? <small>{localError}</small> : null}
            </label>
          ) : localError ? (
            <ErrorMessage message={localError} />
          ) : null}
          {error ? <ErrorMessage message={error} /> : null}
          {successMessage ? <div className="message message--success" role="status">{successMessage}</div> : null}
          <Button type="button" onClick={submitStatus} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar estado'}
          </Button>
        </div>
      </section>
      <CloseBusinessWarningDialog counts={closeWarning} onClose={() => setCloseWarning(null)} />
    </>
  );
}

function DishCard({ dish, onEdit, onDelete }) {
  const imageSrc = useMemo(() => versionAssetUrl(dish.imagenUrl, dish.actualizadoEn), [dish.actualizadoEn, dish.imagenUrl]);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  return (
    <article className="admin-dish-card">
      <div className={`admin-dish-card__visual ${imageSrc && !imageFailed ? 'admin-dish-card__visual--image' : ''}`}>
        {imageSrc && !imageFailed ? (
          <img src={imageSrc} alt={`Fotografía de ${dish.nombre}`} onError={() => setImageFailed(true)} />
        ) : (
          <Utensils aria-hidden="true" size={28} />
        )}
      </div>
      <div className="admin-dish-card__content">
        <div>
          <span className="admin-dish-card__id">ID: {dish.id}</span>
          <span>{dish.categoria || dish.tipoPlatillo || 'Sin categoría'}</span>
        </div>
        <h3>{dish.nombre}</h3>
        <p>{dish.descripcion || 'Sin descripción registrada.'}</p>
      </div>
      <strong className="admin-dish-card__price">{formatCurrency(dish.precio)}</strong>
      <div className="admin-dish-card__actions">
        <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(dish)}>
          <Pencil aria-hidden="true" size={16} />
          Editar
        </Button>
        <Button type="button" variant="danger" size="sm" onClick={() => onDelete(dish)}>
          <Trash2 aria-hidden="true" size={16} />
          Eliminar
        </Button>
      </div>
    </article>
  );
}

function RemoveMenuItemDialog({ item, onClose, onConfirm, isSubmitting }) {
  if (!item) {
    return null;
  }

  return (
    <div className="dish-dialog-backdrop" role="presentation">
      <section className="dish-dialog dish-dialog--compact" role="dialog" aria-modal="true" aria-labelledby="remove-menu-item-title">
        <header className="dish-dialog__header">
          <div>
            <p>Menú del día</p>
            <h2 id="remove-menu-item-title">Quitar platillo</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar diálogo" disabled={isSubmitting}>
            <X aria-hidden="true" size={20} />
          </button>
        </header>
        <div className="dish-dialog-result dish-dialog-result--danger admin-menu-remove-dialog">
          <p>¿Deseas quitar {item.nombre} del menú del día?</p>
          <div className="dish-dialog-result__actions">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" onClick={() => onConfirm(item)} disabled={isSubmitting}>
              {isSubmitting ? 'Quitando...' : 'Quitar del menú'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function menuPayloadFromIds(_menu, ids) {
  return {
    items: ids.map((platilloId) => ({ platilloId }))
  };
}

export function AdminMenuPage() {
  const [menu, setMenu] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [businessStatus, setBusinessStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [error, setError] = useState('');
  const [businessError, setBusinessError] = useState('');
  const [dialogMode, setDialogMode] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [dishToDelete, setDishToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuItemToRemove, setMenuItemToRemove] = useState(null);
  const [isRemovingMenuItem, setIsRemovingMenuItem] = useState(false);
  const [menuActionMessage, setMenuActionMessage] = useState('');
  const [menuActionError, setMenuActionError] = useState('');

  const loadDishes = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true);
    }
    setError('');
    try {
      const items = await getAdminDishes();
      setDishes(items);
      return items;
    } catch (err) {
      setError(getApiMessage(err, 'No se pudo consultar el catálogo de platillos.'));
      return [];
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  const loadMenu = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true);
    }
    setError('');
    try {
      const currentMenu = await getTodayMenu();
      setMenu(currentMenu);
      return currentMenu;
    } catch (err) {
      setError(getApiMessage(err, 'No se pudo consultar el menú del día.'));
      return null;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setLoading(true);
      setBusinessLoading(true);
      setError('');
      setBusinessError('');
      const [menuResult, dishesResult, statusResult] = await Promise.allSettled([
        getTodayMenu(),
        getAdminDishes(),
        getTodayBusinessStatus()
      ]);

      if (!isMounted) {
        return;
      }

      if (menuResult.status === 'fulfilled') {
        setMenu(menuResult.value);
      } else {
        setError(getApiMessage(menuResult.reason, 'No se pudo consultar el menú del día.'));
      }

      if (dishesResult.status === 'fulfilled') {
        setDishes(dishesResult.value);
      } else {
        setError(getApiMessage(dishesResult.reason, 'No se pudo consultar el catálogo de platillos.'));
      }

      if (statusResult.status === 'fulfilled') {
        setBusinessStatus(statusResult.value);
      } else {
        setBusinessError(getApiMessage(statusResult.reason, 'No se pudo consultar el estado de la fonda.'));
      }

      setLoading(false);
      setBusinessLoading(false);
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateDialog = () => {
    setSelectedDish(null);
    setDialogMode('create');
  };

  const openEditDialog = (dish) => {
    setSelectedDish(dish);
    setDialogMode('edit');
  };

  const closeDishDialog = () => {
    setDialogMode(null);
    setSelectedDish(null);
  };

  const handleDishCreated = async (dish) => {
    const nextDish = dish ? { ...dish, imagenVersion: Date.now() } : dish;
    if (nextDish?.id) {
      setDishes((current) => [nextDish, ...current.filter((item) => item.id !== nextDish.id)]);
    }
    await Promise.all([loadDishes(), loadMenu()]);
    closeDishDialog();
  };

  const handleDishUpdated = async (dish) => {
    const imageVersion = Date.now();
    const nextDish = { ...dish, imagenVersion: imageVersion };
    setDishes((current) => current.map((item) => (item.id === nextDish.id ? nextDish : item)));
    setMenu((currentMenu) => {
      if (!currentMenu?.items?.length) {
        return currentMenu;
      }
      return {
        ...currentMenu,
        items: currentMenu.items.map((item) =>
          item.platilloId === nextDish.id
            ? {
                ...item,
                nombre: nextDish.nombre,
                descripcion: nextDish.descripcion,
                precio: nextDish.precio,
                categoria: nextDish.categoria,
                tipoPlatillo: nextDish.tipoPlatillo,
                imagenUrl: nextDish.imagenUrl,
                imagenVersion: imageVersion
              }
            : item
        )
      };
    });
    await Promise.all([loadDishes(), loadMenu()]);
    closeDishDialog();
  };

  const handleDeleteDish = async () => {
    if (!dishToDelete) {
      return;
    }
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteDish(dishToDelete.id);
      setDishes((current) => current.filter((dish) => dish.id !== dishToDelete.id));
      setDishToDelete(null);
      await loadMenu();
    } catch (err) {
      setDeleteError(getApiMessage(err, 'No se pudo eliminar el platillo.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMenuUpdated = (updatedMenu, message = 'Menú del día actualizado.') => {
    setMenu(updatedMenu);
    setMenuActionMessage(message);
    setMenuActionError('');
  };

  const handleMenuItemUpdated = (updatedItem) => {
    setMenu((currentMenu) => {
      if (!currentMenu?.items?.length) {
        return currentMenu;
      }
      return {
        ...currentMenu,
        items: currentMenu.items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      };
    });
    setMenuActionMessage(`${updatedItem.nombre} actualizado en el menú del día.`);
    setMenuActionError('');
  };

  const handleRemoveMenuItem = async (item) => {
    if (!menu) {
      return;
    }

    setIsRemovingMenuItem(true);
    setMenuActionError('');
    setMenuActionMessage('');
    try {
      const currentDishIds = menu?.items.map((menuItem) => menuItem.platilloId).filter(Boolean);
      const nextDishIds = currentDishIds.filter((dishId) => dishId !== item.platilloId);
      const updatedMenu = await updateTodayMenu(menuPayloadFromIds(menu, nextDishIds));
      setMenu(updatedMenu);
      setMenuItemToRemove(null);
      setMenuActionMessage(`${item.nombre} se quitó del menú del día.`);
    } catch (err) {
      setMenuActionError(getApiMessage(err, 'No se pudo quitar el platillo del menú.'));
    } finally {
      setIsRemovingMenuItem(false);
    }
  };

  const activeDishes = dishes.filter((dish) => dish.activo !== false);

  return (
    <div className="admin-menu-layout">
      <AdminWorkspaceSidebar activePath="/admin/menu" />
      <main className="admin-menu-page">
        <header className="admin-menu-header">
          <div>
            <p className="admin-page-header__eyebrow">{'MEN\u00da'}</p>
            <h1 className="admin-page-header__title">{'Administraci\u00f3n de platillos'}</h1>
            <span className="admin-page-header__subtitle">{'Organiza el cat\u00e1logo, el men\u00fa del d\u00eda y la disponibilidad.'}</span>
          </div>
          <AdminHeaderActions />
        </header>

        <section className="admin-menu-page__content" aria-label={'Administraci\u00f3n del men\u00fa'}>
          <BusinessStatusCompactCard
            status={businessStatus}
            loading={businessLoading}
            error={businessError}
            onUpdated={setBusinessStatus}
          />

          <div className="admin-menu-management-header">
            <div>
              <h2>Menú del día</h2>
              <p>Administra los platillos de tu menú</p>
            </div>
            <Button type="button" onClick={openCreateDialog}>
              <Plus aria-hidden="true" size={18} />
              Agregar platillo
            </Button>
          </div>

          {error ? <ErrorMessage message={error} /> : null}
          {menuActionError ? <ErrorMessage message={menuActionError} /> : null}
          {menuActionMessage ? <p className="form-success">{menuActionMessage}</p> : null}

          {loading ? (
            <Loading message="Consultando menú y catálogo..." />
          ) : (
            <>
              <section className="admin-dishes" aria-labelledby="admin-dishes-title">
                <div className="admin-dishes__heading">
                  <div>
                    <h2 id="admin-dishes-title">Catálogo activo</h2>
                    <p>Usa el ID del platillo para agregarlo al menú del día.</p>
                  </div>
                  <span>{activeDishes.length} platillos activos</span>
                </div>

                {activeDishes.length ? (
                  <div className="admin-dishes__list">
                    {activeDishes.map((dish) => (
                      <DishCard key={dish.id} dish={dish} onEdit={openEditDialog} onDelete={setDishToDelete} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Utensils}
                    title="Sin platillos activos"
                    description="Crea platillos para agregarlos al menú del día."
                  />
                )}
              </section>

              <section className="admin-today-menu" aria-labelledby="today-menu-title">
                <div className="admin-today-menu__grid">
                  <div className="admin-today-menu__panel">
                    <h3 id="today-menu-title">Configurar platillos del día</h3>
                    <p>Agrega uno o varios IDs del catálogo activo. Los duplicados se omiten automáticamente.</p>
                    <TodayMenuForm
                      currentMenu={menu}
                      availableDishes={activeDishes}
                      onUpdated={(updatedMenu, message) => handleMenuUpdated(updatedMenu, message)}
                    />
                  </div>
                  <div className="admin-today-menu__panel">
                    <h3>Menú publicado</h3>
                    <p>Controla qué platillos están disponibles para los clientes.</p>
                    <TodayMenuList
                      menu={menu}
                      renderActions={(item) => (
                        <div className="admin-today-menu-actions">
                          <MenuAvailabilityToggle item={item} onUpdated={handleMenuItemUpdated} />
                          <Button type="button" variant="secondary" size="sm" onClick={() => setMenuItemToRemove(item)}>
                            Quitar
                          </Button>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </section>
            </>
          )}
        </section>
      </main>

      {dialogMode === 'create' ? (
        <CreateDishDialog onClose={closeDishDialog} onCreated={handleDishCreated} />
      ) : null}

      {dialogMode === 'edit' && selectedDish ? (
        <EditDishDialog dish={selectedDish} onClose={closeDishDialog} onUpdated={handleDishUpdated} />
      ) : null}

      <RemoveMenuItemDialog
        item={menuItemToRemove}
        isSubmitting={isRemovingMenuItem}
        onClose={() => setMenuItemToRemove(null)}
        onConfirm={handleRemoveMenuItem}
      />

      {dishToDelete ? (
        <div className="dish-dialog-backdrop" role="presentation">
          <section className="dish-dialog dish-dialog--compact" role="dialog" aria-modal="true" aria-labelledby="delete-dish-title">
            <header className="dish-dialog__header">
              <div>
                <p>Catálogo activo</p>
                <h2 id="delete-dish-title">Eliminar platillo</h2>
              </div>
              <button type="button" onClick={() => setDishToDelete(null)} aria-label="Cerrar diálogo" disabled={isDeleting}>
                <X aria-hidden="true" size={20} />
              </button>
            </header>
            <div className="dish-dialog-result dish-dialog-result--danger">
              <span className="dish-dialog-result__icon" aria-hidden="true">
                <Trash2 size={28} />
              </span>
              <h2>¿Eliminar {dishToDelete.nombre}?</h2>
              <p>El platillo dejará de aparecer en el catálogo activo, pero se conservará el historial.</p>
              {deleteError ? <ErrorMessage message={deleteError} /> : null}
              <div className="dish-dialog-result__actions">
                <Button type="button" variant="secondary" onClick={() => setDishToDelete(null)} disabled={isDeleting}>
                  Cancelar
                </Button>
                <Button type="button" variant="danger" onClick={handleDeleteDish} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar platillo'}
                </Button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
