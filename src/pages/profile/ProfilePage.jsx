import { UserCircle } from 'lucide-react';
import { ComingSoon } from '../../shared/ui/ComingSoon.jsx';

export function ProfilePage() {
  return (
    <main className="page page--narrow">
      <ComingSoon
        icon={UserCircle}
        title="Mi perfil"
        description="Esta sección se activará cuando el backend correspondiente esté disponible."
      />
    </main>
  );
}
