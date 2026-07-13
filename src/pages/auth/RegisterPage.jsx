import { Link, Navigate } from 'react-router-dom';
import { RegisterForm } from '../../features/auth/register/RegisterForm.jsx';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { Card } from '../../shared/ui/Card.jsx';

export function RegisterPage() {
  const { isAuthenticated, isEncargada } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isEncargada ? '/admin' : '/'} replace />;
  }

  return (
    <main className="page page--narrow">
      <Card>
        <div className="stack">
          <div>
            <h1 className="card__title">Registro</h1>
            <p className="card__meta">Crea una cuenta de cliente para PuraVida.</p>
          </div>
          <RegisterForm />
          <p className="card__meta">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
          </p>
        </div>
      </Card>
    </main>
  );
}
