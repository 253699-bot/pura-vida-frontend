import { useEffect, useState } from 'react';
import { CheckCircle2, ImagePlus, Trash2, X } from 'lucide-react';
import { createDish, updateDish, uploadDishImage } from '../../../entities/menu/menuApi.js';
import { versionAssetUrl } from '../../../shared/api/assets.js';
import { getApiErrors, getApiMessage } from '../../../shared/api/apiResponse.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../../shared/ui/Input.jsx';

const DISH_TYPES = [
  { value: 'platillo_fuerte', label: 'Plato fuerte' },
  { value: 'bebida', label: 'Bebida' },
  { value: 'complemento', label: 'Complemento' },
  { value: 'postre', label: 'Postre' },
];

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

function normalizePriceBase(value) {
  const rawValue = typeof value === 'string' ? value.trim() : String(value ?? '').trim();

  if (!PRICE_PATTERN.test(rawValue)) {
    return null;
  }

  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  const [integerPart, fractionPart = ''] = rawValue.split('.');
  return `${integerPart}.${fractionPart.padEnd(2, '0')}`;
}

function DialogFrame({ children, titleId, onClose, canClose = true, compact = false }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && canClose) onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canClose, onClose]);

  return (
    <div
      className="dish-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && canClose) onClose();
      }}
    >
      <section className={`dish-dialog ${compact ? 'dish-dialog--compact' : ''}`.trim()} role="dialog" aria-modal="true" aria-labelledby={titleId}>
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
    errors.tipoPlatillo = 'Selecciona un tipo válido.';
  }

  if (values.precioBase === '') {
    errors.precioBase = 'El precio es obligatorio.';
  } else if (!normalizePriceBase(values.precioBase)) {
    errors.precioBase = 'El precio debe ser mayor a cero y usar maximo dos decimales.';
  }

  return errors;
}

function validateImageFile(file) {
  if (!file) return '';

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'La imagen debe ser PNG, JPEG o WebP.';
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return 'La imagen no debe exceder 2 MB.';
  }

  return '';
}

function DishImageField({ titleId, file, previewUrl, currentImageUrl, error, isSubmitting, onChange }) {
  const visibleImage = previewUrl || currentImageUrl || '';

  return (
    <div className="dish-image-field">
      <span className="field__label">Fotografía</span>
      <div className={`dish-image-field__preview ${visibleImage ? '' : 'dish-image-field__preview--empty'}`.trim()}>
        {visibleImage ? (
          <img src={visibleImage} alt="Vista previa del platillo" />
        ) : (
          <ImagePlus size={32} strokeWidth={1.8} aria-hidden="true" />
        )}
      </div>
      <label className="dish-image-field__picker" htmlFor={`${titleId}-image`}>
        <input
          id={`${titleId}-image`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onChange}
          disabled={isSubmitting}
        />
        <span>{file ? 'Reemplazar imagen' : 'Seleccionar imagen'}</span>
      </label>
      <small>{file ? file.name : currentImageUrl ? 'Imagen actual' : 'Sin imagen'}</small>
      {error ? <span className="field__error">{error}</span> : null}
    </div>
  );
}

function DishForm({ titleId, title, values, setValues, isSubmitting, fieldErrors, imageError, error, onSubmit, onClose, submitLabel, currentImageUrl = null }) {
  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    updateValue('imageFile', file);
  }

  return (
    <DialogFrame titleId={titleId} onClose={onClose} canClose={!isSubmitting}>
      <header className="dish-dialog__header">
        <div>
          <p>Catálogo</p>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Cerrar formulario">
          <X size={22} aria-hidden="true" />
        </button>
      </header>
      <form className="dish-form" onSubmit={onSubmit} noValidate>
        <ErrorMessage message={error} />
        <Input label="Nombre del platillo" value={values.nombre} error={fieldErrors.nombre} onChange={(event) => updateValue('nombre', event.target.value)} disabled={isSubmitting} autoFocus />
        <label className="field" htmlFor={`${titleId}-type`}>
          <span className="field__label">Tipo de platillo</span>
          <select id={`${titleId}-type`} className="dish-form__select" value={values.tipoPlatillo} onChange={(event) => updateValue('tipoPlatillo', event.target.value)} disabled={isSubmitting}>
            {DISH_TYPES.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}
          </select>
          {fieldErrors.tipoPlatillo ? <span className="field__error">{fieldErrors.tipoPlatillo}</span> : null}
        </label>
        <label className="field" htmlFor={`${titleId}-description`}>
          <span className="field__label">Descripción breve</span>
          <textarea id={`${titleId}-description`} className="textarea" value={values.descripcion} onChange={(event) => updateValue('descripcion', event.target.value)} disabled={isSubmitting} />
          {fieldErrors.descripcion ? <span className="field__error">{fieldErrors.descripcion}</span> : null}
        </label>
        <Input label="Precio base ($)" type="number" min="0" step="1" inputMode="decimal" value={values.precioBase} error={fieldErrors.precioBase} onChange={(event) => updateValue('precioBase', event.target.value)} onWheel={(event) => { event.preventDefault(); event.currentTarget.blur(); }} disabled={isSubmitting} />
        <DishImageField
          titleId={titleId}
          file={values.imageFile}
          previewUrl={values.imagePreviewUrl}
          currentImageUrl={currentImageUrl}
          error={imageError}
          isSubmitting={isSubmitting}
          onChange={handleImageChange}
        />
        <footer className="dish-dialog__actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : submitLabel}</Button>
        </footer>
      </form>
    </DialogFrame>
  );
}

function useImagePreview(values, setValues) {
  useEffect(() => {
    if (!values.imageFile) {
      if (values.imagePreviewUrl) {
        URL.revokeObjectURL(values.imagePreviewUrl);
        setValues((current) => ({ ...current, imagePreviewUrl: '' }));
      }
      return undefined;
    }

    const previewUrl = URL.createObjectURL(values.imageFile);
    setValues((current) => ({ ...current, imagePreviewUrl: previewUrl }));

    return () => URL.revokeObjectURL(previewUrl);
  }, [setValues, values.imageFile]);
}

export function CreateDishDialog({ onClose, onCreated }) {
  const [values, setValues] = useState({ nombre: '', tipoPlatillo: 'platillo_fuerte', descripcion: '', precioBase: '', imageFile: null, imagePreviewUrl: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useImagePreview(values, setValues);

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateDish(values);
    const nextImageError = validateImageFile(values.imageFile);

    if (Object.keys(validationErrors).length > 0 || nextImageError) {
      setFieldErrors(validationErrors);
      setImageError(nextImageError);
      return;
    }

    setError('');
    setFieldErrors({});
    setImageError('');
    setIsSubmitting(true);

    try {
      const precioBase = normalizePriceBase(values.precioBase);
      let savedDish = await createDish({
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim() || null,
        tipoPlatillo: values.tipoPlatillo,
        precioBase,
      });
      if (values.imageFile) {
        savedDish = await uploadDishImage(savedDish.id, values.imageFile);
      }
      onCreated(savedDish);
    } catch (apiError) {
      setFieldErrors(getApiErrors(apiError));
      setError(getApiMessage(apiError, 'No se pudo guardar el platillo.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return <DishForm titleId="create-dish-title" title="Agregar platillo" values={values} setValues={setValues} isSubmitting={isSubmitting} fieldErrors={fieldErrors} imageError={imageError} error={error} onSubmit={handleSubmit} onClose={onClose} submitLabel="Guardar" />;
}

export function DishCreatedDialog({ dish, onClose }) {
  return (
    <DialogFrame titleId="dish-created-title" onClose={onClose} compact>
      <div className="dish-dialog-result dish-dialog-result--success">
        <span className="dish-dialog-result__icon" aria-hidden="true"><CheckCircle2 size={38} /></span>
        <h2 id="dish-created-title">Guardado</h2>
        <p><strong>{dish.nombre}</strong> se guardó correctamente.</p>
        <Button onClick={onClose}>Aceptar</Button>
      </div>
    </DialogFrame>
  );
}

export function EditDishDialog({ dish, onClose, onUpdated }) {
  const [values, setValues] = useState({
    nombre: dish.nombre || '',
    tipoPlatillo: dish.tipoPlatillo || 'platillo_fuerte',
    descripcion: dish.descripcion || '',
    precioBase: String(dish.precioBase || ''),
    imageFile: null,
    imagePreviewUrl: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useImagePreview(values, setValues);

  useEffect(() => {
    setValues({
      nombre: dish.nombre || '',
      tipoPlatillo: dish.tipoPlatillo || 'platillo_fuerte',
      descripcion: dish.descripcion || '',
      precioBase: String(dish.precioBase || ''),
      imageFile: null,
      imagePreviewUrl: '',
    });
    setFieldErrors({});
    setImageError('');
    setError('');
  }, [dish.id, dish.nombre, dish.tipoPlatillo, dish.descripcion, dish.precioBase, dish.imagenUrl, dish.imagenVersion, dish.actualizadoEn]);
  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateDish(values);
    const nextImageError = validateImageFile(values.imageFile);

    if (Object.keys(validationErrors).length > 0 || nextImageError) {
      setFieldErrors(validationErrors);
      setImageError(nextImageError);
      return;
    }

    setError('');
    setFieldErrors({});
    setImageError('');
    setIsSubmitting(true);

    try {
      const precioBase = normalizePriceBase(values.precioBase);
      let updatedDish = await updateDish(dish.id, {
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim() || null,
        tipoPlatillo: values.tipoPlatillo,
        precioBase,
      });
      if (values.imageFile) {
        updatedDish = await uploadDishImage(dish.id, values.imageFile);
      }
      await onUpdated?.(updatedDish);
      onClose();
    } catch (apiError) {
      setFieldErrors(getApiErrors(apiError));
      setError(getApiMessage(apiError, 'No se pudo actualizar el platillo.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentImageUrl = versionAssetUrl(dish.imagenUrl, dish.imagenVersion ?? dish.actualizadoEn);

  return <DishForm titleId="edit-dish-title" title="Editar platillo" values={values} setValues={setValues} isSubmitting={isSubmitting} fieldErrors={fieldErrors} imageError={imageError} error={error} onSubmit={handleSubmit} onClose={onClose} submitLabel="Guardar cambios" currentImageUrl={currentImageUrl} />;
}

export function DeleteDishDialog({ dish, isDeleting, error, onClose, onConfirm }) {
  return (
    <DialogFrame titleId="delete-dish-title" onClose={onClose} canClose={!isDeleting} compact>
      <div className="dish-dialog-result dish-dialog-result--danger">
        <span className="dish-dialog-result__icon" aria-hidden="true"><Trash2 size={34} /></span>
        <h2 id="delete-dish-title">Eliminar platillo</h2>
        <p><strong>{dish.nombre}</strong> dejará de estar disponible, pero se conservará en el historial.</p>
        <ErrorMessage message={error} />
        <div className="dish-dialog-result__actions">
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? 'Eliminando...' : 'Eliminar platillo'}</Button>
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>Cancelar</Button>
        </div>
      </div>
    </DialogFrame>
  );
}
