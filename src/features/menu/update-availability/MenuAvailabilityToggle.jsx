import { useState } from 'react';
import { updateMenuItemAvailability } from '../../../entities/menu/menuApi.js';
import { getApiMessage } from '../../../shared/api/apiResponse.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage.jsx';

export function MenuAvailabilityToggle({ item, onUpdated }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleToggle() {
    setError('');
    setIsSubmitting(true);

    try {
      const updatedItem = await updateMenuItemAvailability(item.id, {
        disponible: !item.disponible,
      });
      onUpdated?.(updatedItem);
    } catch (apiError) {
      setError(getApiMessage(apiError, 'No se pudo cambiar la disponibilidad.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="stack">
      <Button
        type="button"
        variant={item.disponible ? 'secondary' : 'primary'}
        size="sm"
        onClick={handleToggle}
        disabled={isSubmitting || !item.id}
      >
        {isSubmitting
          ? 'Actualizando...'
          : item.disponible
            ? 'Marcar agotado'
            : 'Marcar disponible'}
      </Button>
      <ErrorMessage message={error} />
    </div>
  );
}
