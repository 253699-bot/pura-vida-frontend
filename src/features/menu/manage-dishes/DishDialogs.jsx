import { useEffect, useState } from 'react';
import { CheckCircle2, Pencil, Trash2, X } from 'lucide-react';
import { createDish } from '../../../entities/menu/menuApi.js';
import { getApiErrors, getApiMessage } from '../../../shared/api/apiResponse.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../../shared/ui/Input.jsx';
import { formatCurrency } from '../../../shared/utils/currency.js';

const DISH_TYPES = [
  { value: 'platillo_fuerte', label: 'Plato fuerte' },
  { value: 'bebida', label: 'Bebida' },
  { value: 'complemento', label: 'Complemento' },
  { value: 'postre', label: 'Postre' },
];

function DialogFrame({ children, titleId, onClose, canClose = true, compact = false }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && canClose) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canClose, onClose]);

  return (
    <div
      className="dish-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && canClose) {
          onClose();
        }
      }}
    >
      <section
        className={`dish-dialog ${compact ? 'dish-dialog--compact' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {children}
      </section>
    </div>
  );
}

function validateDish(values) {
  const errors = {};

  if (!values.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio.';
  } else if (values.nombre.trim().length > 150) {
    errors.nombre = 'El nombre no debe exceder 150 caracteres.';
  }

  if (!DISH_TYPES.some((type) => type.value === values.tipoPlatillo)) {
    errors.tipoPlatillo = 'Selecciona un tipo de platillo válido.';
  }

  if (values.precioBase === '') {
    errors.precioBase = 'El precio es obligatorio.';
  } else if (!Number.isFinite(Number(values.precioBase)) || Number(values.precioBase) <= 0) {
    errors.precioBase = 'El precio debe ser mayor a cero.';
  }

  return errors;
}

export function CreateDishDialog({ onClose, onCreated }) {
  const [values, setValues] = useState({
    nombre: '',
    tipoPlatillo: 'platillo_fuerte',
    descripcion: '',
    precioBase: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateDish(values);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const createdDish = await createDish({
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim() || null,
        tipoPlatillo: values.tipoPlatillo,
        precioBase: Number(values.precioBase),
      });
      onCreated(createdDish);
    } catch (apiError) {
      setFieldErrors(getApiErrors(apiError));
      setError(getApiMessage(apiError, 'No se pudo guardar el platillo.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DialogFrame titleId="create-dish-title" onClose={onClose} canClose={!isSubmitting}>
      <header className="dish-dialog__header">
        <div>
          <p>Catálogo</p>
          <h2 id="create-dish-title">Agregar platillo</h2>
        </div>
        <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Cerrar formulario">
          <X size={22} aria-hidden="true" />
        </button>
      </header>
      <form className="dish-form" onSubmit={handleSubmit} noValidate>
        <ErrorMessage message={error} />
        <Input
          label="Nombre del platillo"
          name="nombre"
          placeholder="Ej. Lasaña vegetariana"
          value={values.nombre}
          error={fieldErrors.nombre}
          onChange={(event) => updateValue('nombre', event.target.value)}
          disabled={isSubmitting}
          autoFocus
        />
        <label className="field" htmlFor="dish-type">
          <span className="field__label">Tipo de platillo</span>
          <select
            id="dish-type"
            className="dish-form__select"
            value={values.tipoPlatillo}
            onChange={(event) => updateValue('tipoPlatillo', event.target.value)}
            disabled={isSubmitting}
          >
            {DISH_TYPES.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}
          </select>
          {fieldErrors.tipoPlatillo ? <span className="field__error">{fieldErrors.tipoPlatillo}</span> : null}
        </label>
        <label className="field" htmlFor="dish-description">
          <span className="field__label">Descripción breve</span>
          <textarea
            id="dish-description"
            className="textarea"
            placeholder="Ingredientes principales o estilo..."
            value={values.descripcion}
            onChange={(event) => updateValue('descripcion', event.target.value)}
            disabled={isSubmitting}
          />
          {fieldErrors.descripcion ? <span className="field__error">{fieldErrors.descripcion}</span> : null}
        </label>
        <Input
          label="Precio base ($)"
          name="precioBase"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={values.precioBase}
          error={fieldErrors.precioBase}
          onChange={(event) => updateValue('precioBase', event.target.value)}
          disabled={isSubmitting}
        />
        <footer className="dish-dialog__actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
        </footer>
      </form>
    </DialogFrame>
  );
}

export function DishCreatedDialog({ dish, onClose }) {
  return (
    <DialogFrame titleId="dish-created-title" onClose={onClose} compact>
      <div className="dish-dialog-result dish-dialog-result--success">
        <span className="dish-dialog-result__icon" aria-hidden="true"><CheckCircle2 size={38} /></span>
        <h2 id="dish-created-title">¡Excelente!</h2>
        <p><strong>{dish.nombre}</strong> se guardó correctamente.</p>
        <Button onClick={onClose}>Aceptar</Button>
      </div>
    </DialogFrame>
  );
}

export function EditDishDialog({ dish, onClose }) {
  const typeLabel = DISH_TYPES.find((type) => type.value === dish.tipoPlatillo)?.label || dish.tipoPlatillo;

  return (
    <DialogFrame titleId="edit-dish-title" onClose={onClose}>
      <header className="dish-dialog__header">
        <div>
          <p>Solo consulta</p>
          <h2 id="edit-dish-title">Editar platillo</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar detalle">
          <X size={22} aria-hidden="true" />
        </button>
      </header>
      <div className="dish-form">
        <div className="dish-edit-notice">
          <Pencil size={20} aria-hidden="true" />
          <span>La edición de platillos requiere endpoint de actualización en backend.</span>
        </div>
        <Input label="Nombre del platillo" value={dish.nombre} disabled readOnly />
        <Input label="Tipo de platillo" value={typeLabel} disabled readOnly />
        <label className="field" htmlFor="dish-edit-description">
          <span className="field__label">Descripción breve</span>
          <textarea id="dish-edit-description" className="textarea" value={dish.descripcion} disabled readOnly />
        </label>
        <Input label="Precio base" value={formatCurrency(dish.precioBase)} disabled readOnly />
        <footer className="dish-dialog__actions">
          <Button onClick={onClose}>Entendido</Button>
        </footer>
      </div>
    </DialogFrame>
  );
}

export function DeleteDishDialog({ dish, isDeleting, error, onClose, onConfirm }) {
  return (
    <DialogFrame titleId="delete-dish-title" onClose={onClose} canClose={!isDeleting} compact>
      <div className="dish-dialog-result dish-dialog-result--danger">
        <span className="dish-dialog-result__icon" aria-hidden="true"><Trash2 size={34} /></span>
        <h2 id="delete-dish-title">¿Eliminar platillo?</h2>
        <p>
          <strong>{dish.nombre}</strong> dejará de estar disponible, pero se conservará en el historial.
        </p>
        <ErrorMessage message={error} />
        <div className="dish-dialog-result__actions">
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Sí, eliminar platillo'}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>Cancelar</Button>
        </div>
      </div>
    </DialogFrame>
  );
}
