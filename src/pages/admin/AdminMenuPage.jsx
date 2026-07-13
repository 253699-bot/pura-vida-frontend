import { useEffect, useState } from 'react';
import { getTodayMenu } from '../../entities/menu/menuApi.js';
import { MenuAvailabilityToggle } from '../../features/menu/update-availability/MenuAvailabilityToggle.jsx';
import { TodayMenuForm } from '../../features/menu/update-today-menu/TodayMenuForm.jsx';
import { TodayMenuList } from '../../features/menu/view-today-menu/TodayMenuList.jsx';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { Card } from '../../shared/ui/Card.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';

export function AdminMenuPage() {
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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
    }

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, []);

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
    </main>
  );
}
