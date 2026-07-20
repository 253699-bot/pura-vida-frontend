import { Link, Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../features/auth/login/LoginForm.jsx';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { Card } from '../../shared/ui/Card.jsx';

export function LoginPage() {
  const { isAuthenticated, isEncargada } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={isEncargada ? '/admin' : '/'} replace />;
  }

  return (
    <main className="page page--narrow">
      <Card>
        <div className="stack">
          <div>
            <h1 className="card__title">Iniciar sesión</h1>
            <p className="card__meta">Entra con tu correo para continuar.</p>
          </div>
          {location.state?.registered ? (
            <div className="message message--success">Cuenta creada. Ya puedes iniciar sesión.</div>
          ) : null}
          <LoginForm />
          <p className="card__meta">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </Card>
    </main>
  );
}
