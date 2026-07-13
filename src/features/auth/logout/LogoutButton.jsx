import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { Button } from '../../../shared/ui/Button.jsx';

export function LogoutButton({ variant = 'secondary', size = 'md' }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={handleLogout}>
      Cerrar sesion
    </Button>
  );
}
