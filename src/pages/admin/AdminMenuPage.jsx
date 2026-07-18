import { useCallback, useEffect, useState } from 'react';
import { Coffee, Leaf, Pencil, Plus, Trash2, Utensils } from 'lucide-react';
import {
  deleteDish,
  getAdminDishes,
  getTodayMenu,
} from '../../entities/menu/menuApi.js';
import {
  CreateDishDialog,
  DeleteDishDialog,
  DishCreatedDialog,
  EditDishDialog,
} from '../../features/menu/manage-dishes/DishDialogs.jsx';
import { MenuAvailabilityToggle } from '../../features/menu/update-availability/MenuAvailabilityToggle.jsx';
import { TodayMenuForm } from '../../features/menu/update-today-menu/TodayMenuForm.jsx';
import { TodayMenuList } from '../../features/menu/view-today-menu/TodayMenuList.jsx';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { Button } from '../../shared/ui/Button.jsx';
import { Card } from '../../shared/ui/Card.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import './AdminMenuPage.css';

const DISH_PRESENTATION = {
  platillo_fuerte: { label: 'Plato fuerte', icon: Utensils },
  bebida: { label: 'Bebida', icon: Coffee },
  complemento: { label: 'Complemento', icon: Leaf },
  postre: { label: 'Postre', icon: Utensils },
};

function DishCard({ dish, onEdit, onDelete }) {
  const presentation = DISH_PRESENTATION[dish.tipoPlatillo] || DISH_PRESENTATION.platillo_fuerte;
  const Icon = presentation.icon;

  return (
    <article className="admin-dish-card">
      <span className="admin-dish-card__visual" aria-hidden="true">
        <Icon size={30} strokeWidth={1.8} />
      </span>
      <div className="admin-dish-card__content">
        <div className="admin-dish-card__title-row">
          <div>
            <h3>{dish.nombre}</h3>
            <span>{presentation.label}</span>
          </div>
          <strong>{formatCurrency(dish.precioBase)}</strong>
        </div>
        <p>{dish.descripcion || 'Sin descripción.'}</p>
      </div>
      <span className="admin-dish-card__status">Activo</span>
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

export function AdminMenuPage() {
  const [dishes, setDishes] = useState([]);
  const [menu, setMenu] = useState(null);
  const [dishesError, setDishesError] = useState('');
  const [menuError, setMenuError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoadingDishes, setIsLoadingDishes] = useState(true);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createdDish, setCreatedDish] = useState(null);
  const [editingDish, setEditingDish] = useState(null);
  const [deletingDish, setDeletingDish] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDishes = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setIsLoadingDishes(true);
    }

    setDishesError('');

    try {
      const activeDishes = await getAdminDishes();
      setDishes(activeDishes);
      return activeDishes;
    } catch (apiError) {
      setDishesError(getApiMessage(apiError, 'No se pudo consultar el catálogo de platillos.'));
      return null;
    } finally {
      if (showLoading) {
        setIsLoadingDishes(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      const [dishesResult, menuResult] = await Promise.allSettled([
        getAdminDishes(),
        getTodayMenu(),
      ]);

      if (!isMounted) {
        return;
      }

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

      setIsLoadingDishes(false);
      setIsLoadingMenu(false);
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDishCreated(dish) {
    setIsCreateOpen(false);
    setSuccessMessage('');
    await loadDishes();
    setCreatedDish(dish);
  }

  function handleRequestDelete(dish) {
    setDeleteError('');
    setDeletingDish(dish);
  }

  async function handleConfirmDelete() {
    if (!deletingDish) {
      return;
    }

    setDeleteError('');
    setIsDeleting(true);

    try {
      await deleteDish(deletingDish.id);
      const deletedName = deletingDish.nombre;
      setDeletingDish(null);
      await loadDishes();
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

  function handleItemUpdated(updatedItem) {
    setMenu((currentMenu) => {
      if (!currentMenu) {
        return currentMenu;
      }

      return {
        ...currentMenu,
        items: currentMenu.items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      };
    });
  }

  return (
    <main className="page admin-menu-page">
      <header className="admin-menu-header">
        <div>
          <p className="admin-menu-header__eyebrow">Menú y catálogo</p>
          <h1 className="page__title">Administración de platillos</h1>
          <p className="page__subtitle">Crea platillos, consulta el catálogo activo y configura el menú del día.</p>
        </div>
        <Button onClick={() => {
          setSuccessMessage('');
          setIsCreateOpen(true);
        }}>
          <Plus size={18} aria-hidden="true" />
          Agregar platillo
        </Button>
      </header>

      <ErrorMessage message={dishesError} />
      {successMessage ? <div className="message message--success" role="status">{successMessage}</div> : null}

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

      <section className="admin-today-menu" aria-labelledby="admin-today-menu-title">
        <div className="admin-dishes__heading">
          <div>
            <h2 id="admin-today-menu-title">Publicar menú del día</h2>
            <p>Selecciona por ID los platillos activos y administra su disponibilidad de hoy.</p>
          </div>
        </div>
        {isLoadingMenu ? <Loading label="Cargando menú de hoy..." /> : null}
        <ErrorMessage message={menuError} />
        {!isLoadingMenu ? (
          <div className="admin-today-menu__grid">
            <Card>
              <div className="stack">
                <div>
                  <h3 className="card__title">Configurar platillos publicados</h3>
                  <p className="card__meta">Captura los IDs visibles en el catálogo, separados por coma.</p>
                </div>
                <TodayMenuForm onUpdated={setMenu} />
              </div>
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
        ) : null}
      </section>

      {isCreateOpen ? (
        <CreateDishDialog onClose={() => setIsCreateOpen(false)} onCreated={handleDishCreated} />
      ) : null}
      {createdDish ? <DishCreatedDialog dish={createdDish} onClose={() => setCreatedDish(null)} /> : null}
      {editingDish ? <EditDishDialog dish={editingDish} onClose={() => setEditingDish(null)} /> : null}
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
    </main>
  );
}
