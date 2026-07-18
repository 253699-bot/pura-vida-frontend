import { Check, ClipboardList, Info, WalletCards, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createManualSale } from '../../entities/sales/salesApi.js';
import { getApiErrors, getApiMessage } from '../../shared/api/apiResponse.js';
import { Button } from '../../shared/ui/Button.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../shared/ui/Input.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';
import './AdminManualSalesPage.css';

const INITIAL_FORM = {
  total: '',
  observaciones: '',
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

function validateForm(form) {
  const errors = {};
  const total = form.total.trim();

  if (!total) {
    errors.total = 'Ingresa el total de la venta.';
  } else if (!/^\d{1,8}(\.\d{1,2})?$/.test(total) || Number(total) <= 0) {
    errors.total = 'Usa un monto mayor a cero, con máximo dos decimales.';
  }

  return errors;
}

function SaleSuccessDialog({ sale, onClose }) {
  return (
    <div className="manual-sale-success" role="presentation">
      <section
        className="manual-sale-success__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-sale-success-title"
      >
        <button className="manual-sale-success__close" type="button" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>
        <span className="manual-sale-success__icon" aria-hidden="true">
          <Check size={42} strokeWidth={3} />
        </span>
        <p className="manual-sale-success__eyebrow">Registro completado</p>
        <h2 id="manual-sale-success-title">Venta registrada correctamente</h2>
        <p>La venta manual quedó guardada y ya forma parte de las métricas administrativas.</p>

        <dl className="manual-sale-success__summary">
          {sale?.id ? (
            <div>
              <dt>Folio</dt>
              <dd>#{sale.id}</dd>
            </div>
          ) : null}
          <div>
            <dt>Total</dt>
            <dd>{currencyFormatter.format(Number(sale?.total || 0))}</dd>
          </div>
          {sale?.fecha ? (
            <div>
              <dt>Fecha</dt>
              <dd>{sale.fecha}</dd>
            </div>
          ) : null}
        </dl>

        <div className="manual-sale-success__actions">
          <Button onClick={onClose}>Registrar otra venta</Button>
          <Link className="button button--secondary button--md" to="/admin/reports/weekly">
            Ver reporte semanal
          </Link>
        </div>
      </section>
    </div>
  );
}

export function AdminManualSalesPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSale, setCreatedSale] = useState(null);

  const totalPreview = Number(form.total) > 0 ? Number(form.total) : 0;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const sale = await createManualSale({
        total: form.total.trim(),
        observaciones: form.observaciones.trim() || null,
      });
      setCreatedSale(sale);
      setForm(INITIAL_FORM);
      setFieldErrors({});
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
          <span className="manual-sales-page__heading-icon" aria-hidden="true">
            <WalletCards size={28} />
          </span>
          <div>
            <p>Ventas</p>
            <h1>Registro de ventas manuales</h1>
            <span>Captura ventas realizadas fuera de los pedidos de la plataforma.</span>
          </div>
        </header>

        <div className="manual-sales-page__content">
          <div className="manual-sales-page__notice">
            <Info size={21} aria-hidden="true" />
            <p>
              Registra el importe total confirmado. El contrato actual de la API no recibe partidas individuales;
              puedes documentar el contexto en observaciones.
            </p>
          </div>

          <form className="manual-sale-form" onSubmit={handleSubmit} noValidate>
            <section className="manual-sale-form__card">
              <div className="manual-sale-form__section-title">
                <ClipboardList size={22} aria-hidden="true" />
                <div>
                  <h2>Datos de la venta</h2>
                  <p>Los campos marcados son necesarios para guardar el registro.</p>
                </div>
              </div>

              <Input
                id="manual-sale-total"
                name="total"
                label="Total de la venta *"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={form.total}
                error={fieldErrors.total}
                onChange={handleChange}
                disabled={isSubmitting}
              />

              <label className="field" htmlFor="manual-sale-observations">
                <span className="field__label">Observaciones</span>
                <textarea
                  id="manual-sale-observations"
                  className="input manual-sale-form__textarea"
                  name="observaciones"
                  rows="5"
                  placeholder="Ej. Venta registrada directamente en mostrador."
                  value={form.observaciones}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {fieldErrors.observaciones ? (
                  <span className="field__error">{fieldErrors.observaciones}</span>
                ) : (
                  <span className="manual-sale-form__counter">Campo opcional</span>
                )}
              </label>

              <ErrorMessage title="No se pudo guardar" message={error} />
            </section>

            <aside className="manual-sale-total-card">
              <span>Total a registrar</span>
              <strong>{currencyFormatter.format(totalPreview)}</strong>
              <p>El importe se enviará como venta manual y no se asociará a un pedido.</p>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando venta...' : 'Guardar registro'}
              </Button>
            </aside>
          </form>
        </div>
      </main>

      {createdSale ? <SaleSuccessDialog sale={createdSale} onClose={() => setCreatedSale(null)} /> : null}
    </div>
  );
}
