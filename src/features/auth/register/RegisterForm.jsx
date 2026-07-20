import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrors, getApiMessage } from '../../../shared/api/apiResponse.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../../shared/ui/Input.jsx';

const INITIAL_FORM = {
  nombre: '',
  correo: '',
  telefono: '',
  password: '',
};

export function RegisterForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await register({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim() || null,
        password: form.password,
      });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (apiError) {
      setError(getApiMessage(apiError, 'No se pudo crear la cuenta.'));
      setFieldErrors(getApiErrors(apiError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />
      <Input
        label="Nombre"
        name="nombre"
        autoComplete="name"
        value={form.nombre}
        error={fieldErrors.nombre}
        onChange={updateField}
        required
      />
      <Input
        label="Correo"
        name="correo"
        type="email"
        autoComplete="email"
        value={form.correo}
        error={fieldErrors.correo}
        onChange={updateField}
        required
      />
      <Input
        label="Teléfono"
        name="telefono"
        type="tel"
        autoComplete="tel"
        value={form.telefono}
        error={fieldErrors.telefono}
        onChange={updateField}
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        value={form.password}
        error={fieldErrors.password}
        onChange={updateField}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  );
}
