import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ErrorMessage } from '../ui/ErrorMessage.jsx';

export function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const hasRequiredRole = roles.length === 0 || roles.includes(user?.rol);

  if (!hasRequiredRole) {
    return (
      <main className="page page--narrow">
        <ErrorMessage
          title="Acceso restringido"
          message="Tu cuenta no tiene permisos para abrir esta seccion."
        />
      </main>
    );
  }

  return children;
}
