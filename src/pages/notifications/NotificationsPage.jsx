import { Bell } from 'lucide-react';
import { ComingSoon } from '../../shared/ui/ComingSoon.jsx';

export function NotificationsPage() {
  return (
    <main className="page page--narrow">
      <ComingSoon
        icon={Bell}
        title="Notificaciones"
        description="Esta sección se activará cuando el backend correspondiente esté disponible."
      />
    </main>
  );
}
