import { useState } from 'react';
import { updateTodayMenu } from '../../../entities/menu/menuApi.js';
import { getApiErrors, getApiMessage } from '../../../shared/api/apiResponse.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../../shared/ui/Input.jsx';

function parseDishIds(value) {
  const parts = value.split(',').map((part) => part.trim());

  if (!value.trim()) {
    return { error: 'Captura al menos un ID de platillo.' };
  }

  if (parts.some((part) => part.length === 0)) {
    return { error: 'Revisa el formato de IDs separados por coma.' };
  }

  const ids = parts.map((part) => Number(part));
  const hasInvalidId = ids.some((id) => !Number.isInteger(id) || id <= 0);

  if (hasInvalidId) {
    return { error: 'Todos los IDs deben ser numeros positivos.' };
  }

  if (new Set(ids).size !== ids.length) {
    return { error: 'No repitas IDs de platillos.' };
  }

  return { ids };
}

export function TodayMenuForm({ onUpdated }) {
  const [dishIds, setDishIds] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    try {
      const updatedMenu = await updateTodayMenu({
        items: parsed.ids.map((platilloId) => ({ platilloId })),
      });
      setSuccess('Menu actualizado.');
      onUpdated?.(updatedMenu);
    } catch (apiError) {
      setError(getApiMessage(apiError, 'No se pudo actualizar el menu.'));
      setFieldErrors(getApiErrors(apiError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />
      {success ? <div className="message message--success">{success}</div> : null}
      <Input
        label="IDs de platillos"
        name="dishIds"
        placeholder="1,2,3"
        value={dishIds}
        error={fieldErrors.dishIds || fieldErrors.items}
        onChange={(event) => setDishIds(event.target.value)}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Configurar menu'}
      </Button>
    </form>
  );
}
