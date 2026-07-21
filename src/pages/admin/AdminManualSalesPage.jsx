import { Check, ClipboardList, Info, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTodayMenu } from '../../entities/menu/menuApi.js';
import { createManualSale } from '../../entities/sales/salesApi.js';
import { getApiErrors, getApiMessage } from '../../shared/api/apiResponse.js';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import { AdminHeaderActions } from './components/AdminHeaderActions.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';

import './AdminManualSalesPage.css';
import './components/AdminPageHeader.css';

function createIdempotencyKey() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `manual-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function SaleSuccessDialog({ sale, onClose }) {
  return (
    <div className="manual-sale-success" role="presentation">
      <section className="manual-sale-success__dialog" role="dialog" aria-modal="true" aria-labelledby="manual-sale-success-title">
        <button className="manual-sale-success__close" type="button" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>
        <span className="manual-sale-success__icon" aria-hidden="true">
          <Check size={42} strokeWidth={3} />
        </span>
        <p className="manual-sale-success__eyebrow">Registro completado</p>
        <h2 id="manual-sale-success-title">Venta registrada correctamente</h2>
        <p>La venta manual quedó guardada con partidas del menú publicado.</p>

        <dl className="manual-sale-success__summary">
          {sale?.id ? <div><dt>Folio</dt><dd>#{sale.id}</dd></div> : null}
          <div><dt>Total</dt><dd>{formatCurrency(Number(sale?.total || 0))}</dd></div>
          {sale?.fecha ? <div><dt>Fecha</dt><dd>{sale.fecha}</dd></div> : null}
        </dl>

        {sale?.items?.length ? (
          <div className="manual-sale-success__items">
            {sale.items.map((item) => (
              <span key={item.id || item.menuItemId}>{item.cantidad}x {item.nombre}</span>
            ))}
          </div>
        ) : null}

        <div className="manual-sale-success__actions">
          <Button onClick={onClose}>Registrar otra venta</Button>
          <Link className="button button--secondary button--md" to="/admin/reports/weekly">Ver reportes</Link>
        </div>
      </section>
    </div>
  );
}

export function AdminManualSalesPage() {
  const [menu, setMenu] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSale, setCreatedSale] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      try {
        const todayMenu = await getTodayMenu();
        if (isMounted) setMenu(todayMenu);
      } catch (requestError) {
        if (isMounted) setError(getApiMessage(requestError, 'No se pudo cargar el menú publicado.'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const availableItems = useMemo(
    () => (menu?.items || []).filter((item) => item.id && item.disponible),
    [menu],
  );

  const selectedItems = useMemo(
    () => availableItems
      .map((item) => ({ ...item, cantidad: Number(quantities[item.id] || 0) }))
      .filter((item) => item.cantidad > 0),
    [availableItems, quantities],
  );

  const totalPreview = selectedItems.reduce((total, item) => total + item.cantidad * Number(item.precio || 0), 0);

  function updateQuantity(itemId, value) {
    const normalized = value === '' ? '' : Math.max(0, Number(value || 0));
    setQuantities((current) => ({ ...current, [itemId]: normalized }));
    setFieldErrors({});
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedItems.length) {
      setFieldErrors({ items: 'Selecciona al menos un platillo con cantidad positiva.' });
      return;
    }

    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      const sale = await createManualSale(
        {
          items: selectedItems.map((item) => ({ menuItemId: item.id, cantidad: item.cantidad })),
        },
        createIdempotencyKey(),
      );
      setCreatedSale(sale);
      setQuantities({});
    } catch (requestError) {
      setFieldErrors(getApiErrors(requestError));
      setError(getApiMessage(requestError, 'No fue posible registrar la venta manual.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="manual-sales-layout">
      <AdminWorkspaceSidebar activePath="/admin/sales/manual" />

      <main className="manual-sales-page">
        <header className="manual-sales-page__header">
          <div>
            <p>Ventas</p>
            <h1 className="admin-page-header__title">Registro de ventas manuales</h1>
            <span>Captura ventas de mostrador usando el menú publicado de hoy.</span>
          </div>
          <AdminHeaderActions />
        </header>

        <div className="manual-sales-page__content">
          <div className="manual-sales-page__notice">
            <Info size={21} aria-hidden="true" />
            <p>El backend calcula el total con precios vigentes del menú y rechaza ítems agotados o no publicados.</p>
          </div>

          {isLoading ? <Loading label="Cargando menú publicado..." /> : null}
          <ErrorMessage title="No se pudo guardar" message={error} />

          {!isLoading && !error && !availableItems.length ? (
            <EmptyState title="No hay ítems vendibles" message="Publica y habilita al menos un platillo en el menú de hoy." />
          ) : null}

          {!isLoading && availableItems.length ? (
            <form className="manual-sale-form" onSubmit={handleSubmit} noValidate>
              <section className="manual-sale-form__card">
                <div className="manual-sale-form__section-title">
                  <ClipboardList size={22} aria-hidden="true" />
                  <div>
                    <h2>Registro de ventas</h2>
                    <p>Indica cantidades para los platillos vendidos en mostrador.</p>
                  </div>
                </div>

                <div className="manual-sale-items">
                  {availableItems.map((item) => (
                    <label className="manual-sale-item" key={item.id}>
                      <span>
                        <strong>{item.nombre}</strong>
                        <small>{formatCurrency(item.precio)}</small>
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={quantities[item.id] ?? ''}
                        onChange={(event) => updateQuantity(item.id, event.target.value)}
                        disabled={isSubmitting}
                        aria-label={`Cantidad para ${item.nombre}`}
                      />
                    </label>
                  ))}
                </div>
                {fieldErrors.items ? <span className="field__error">{fieldErrors.items}</span> : null}
              </section>

              <aside className="manual-sale-total-card">
                <span>Total estimado</span>
                <strong>{formatCurrency(totalPreview)}</strong>
                <p>Vista previa; el total persistido lo calcula el backend.</p>
                <Button type="submit" disabled={isSubmitting || !selectedItems.length}>
                  {isSubmitting ? 'Guardando venta...' : 'Guardar registro'}
                </Button>
              </aside>
            </form>
          ) : null}
        </div>
      </main>

      {createdSale ? <SaleSuccessDialog sale={createdSale} onClose={() => setCreatedSale(null)} /> : null}
    </div>
  );
}
