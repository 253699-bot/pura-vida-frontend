import { useEffect, useState } from 'react';
import { updateTodayBusinessStatus } from '../../../entities/business/businessApi.js';
import { getApiErrors, getApiMessage } from '../../../shared/api/apiResponse.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage.jsx';

export function BusinessStatusForm({ status, onUpdated }) {
  const [abierto, setAbierto] = useState(true);
  const [motivoCierre, setMotivoCierre] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!status) {
      return;
    }

    setAbierto(status.abierto !== false);
    setMotivoCierre(status.motivoCierre || '');
  }, [status]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccess('');

    if (!abierto && !motivoCierre.trim()) {
      setFieldErrors({ motivoCierre: 'Indica el motivo de cierre.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedStatus = await updateTodayBusinessStatus({
        abierto,
        motivoCierre: abierto ? null : motivoCierre.trim(),
      });
      setSuccess('Estado actualizado.');
      onUpdated?.(updatedStatus);
    } catch (apiError) {
      setError(getApiMessage(apiError, 'No se pudo actualizar el estado.'));
      setFieldErrors(getApiErrors(apiError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />
      {success ? <div className="message message--success">{success}</div> : null}
      <fieldset className="field">
        <legend className="field__label">Servicio de hoy</legend>
        <div className="segmented">
          <label className="segmented__option">
            <input
              type="radio"
              name="abierto"
              value="true"
              checked={abierto}
              onChange={() => setAbierto(true)}
            />
            Abierto
          </label>
          <label className="segmented__option">
            <input
              type="radio"
              name="abierto"
              value="false"
              checked={!abierto}
              onChange={() => setAbierto(false)}
            />
            Cerrado
          </label>
        </div>
      </fieldset>
      <label className="field" htmlFor="motivoCierre">
        <span className="field__label">Motivo de cierre</span>
        <textarea
          id="motivoCierre"
          name="motivoCierre"
          className="textarea"
          value={motivoCierre}
          onChange={(event) => setMotivoCierre(event.target.value)}
          disabled={abierto}
        />
        {fieldErrors.motivoCierre ? (
          <span className="field__error">{fieldErrors.motivoCierre}</span>
        ) : null}
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar estado'}
      </Button>
    </form>
  );
}
