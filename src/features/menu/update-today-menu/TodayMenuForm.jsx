import { useMemo, useState } from 'react';
import { updateTodayMenu } from '../../../entities/menu/menuApi.js';
import { getApiErrors, getApiMessage } from '../../../shared/api/apiResponse.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../../shared/ui/Input.jsx';

function parseDishIds(value) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return { error: 'Escribe al menos un ID de platillo.' };
  }

  const parts = normalizedValue.split(',').map((part) => part.trim());

  if (parts.some((part) => part.length === 0)) {
    return { error: 'Separa los IDs con comas y evita comas vacías.' };
  }

  const ids = parts.map((part) => Number(part));
  const hasInvalidId = ids.some((id) => !Number.isInteger(id) || id <= 0);

  if (hasInvalidId) {
    return { error: 'Todos los IDs deben ser enteros positivos.' };
  }

  return { ids: [...new Set(ids)] };
}

function toPayload(ids) {
  return { items: ids.map((platilloId) => ({ platilloId })) };
}

export function TodayMenuForm({ currentMenu = null, onUpdated }) {
  const [dishIds, setDishIds] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDishIds = useMemo(
    () => (currentMenu?.items || [])
      .map((item) => item.platilloId)
      .filter((id) => Number.isInteger(id) && id > 0),
    [currentMenu],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccess('');

    const parsed = parseDishIds(dishIds);

    if (parsed.error) {
      setFieldErrors({ dishIds: parsed.error });
      return;
    }

    const alreadyPublished = parsed.ids.filter((id) => currentDishIds.includes(id));
    if (alreadyPublished.length) {
      setFieldErrors({ dishIds: `Ya publicados en el menú de hoy: ${alreadyPublished.join(', ')}.` });
      return;
    }

    const nextIds = [...currentDishIds, ...parsed.ids];
    if (!nextIds.length) {
      setFieldErrors({ dishIds: 'No hay IDs para publicar.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedMenu = await updateTodayMenu(toPayload(nextIds));
      onUpdated?.(updatedMenu);
      setDishIds('');
      setSuccess(parsed.ids.length === 1
        ? `Platillo ID ${parsed.ids[0]} agregado.`
        : `Platillos agregados: ${parsed.ids.join(', ')}.`);
    } catch (apiError) {
      setError(getApiMessage(apiError, 'No se pudo actualizar el menú.'));
      setFieldErrors(getApiErrors(apiError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="today-menu-form" onSubmit={handleSubmit} noValidate>
      <ErrorMessage message={error} />
      {success ? <div className="message message--success">{success}</div> : null}

      <div className="today-menu-form__row">
        <Input
          label="Agregar por ID"
          name="dishIds"
          placeholder="12 o 12, 14, 20"
          value={dishIds}
          error={fieldErrors.dishIds || fieldErrors.items}
          onChange={(event) => {
            setDishIds(event.target.value);
            setFieldErrors({});
            setError('');
            setSuccess('');
          }}
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Agregando...' : 'Agregar'}
        </Button>
      </div>
    </form>
  );
}
