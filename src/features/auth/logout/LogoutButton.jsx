import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { LogoutConfirmationDialog } from './LogoutConfirmationDialog.jsx';

export function LogoutButton({ variant = 'secondary', size = 'md' }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);

  function confirmLogout() {
    logout();
    setIsConfirming(false);
    navigate('/', { replace: true });
  }

  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => setIsConfirming(true)}>
        Cerrar sesión
      </Button>
      <LogoutConfirmationDialog
        open={isConfirming}
        onCancel={() => setIsConfirming(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}