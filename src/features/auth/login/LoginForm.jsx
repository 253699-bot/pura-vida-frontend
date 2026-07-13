import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { USER_ROLES } from '../../../shared/constants/roles.js';
import { getApiErrors, getApiMessage } from '../../../shared/api/apiResponse.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../../shared/ui/Input.jsx';

const INITIAL_FORM = {
  correo: '',
  password: '',
};

export function LoginForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      const authData = await login({
        correo: form.correo.trim(),
        password: form.password,
      });
      const fromPath = location.state?.from?.pathname;
      const target =
        authData.user?.rol === USER_ROLES.ENCARGADA
          ? fromPath?.startsWith('/admin')
            ? fromPath
            : '/admin'
          : '/';

      navigate(target, { replace: true });
    } catch (apiError) {
      setError(getApiMessage(apiError, 'No se pudo iniciar sesion.'));
      setFieldErrors(getApiErrors(apiError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />
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
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={form.password}
        error={fieldErrors.password}
        onChange={updateField}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
