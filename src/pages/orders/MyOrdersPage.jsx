import { Package } from 'lucide-react';
import { ComingSoon } from '../../shared/ui/ComingSoon.jsx';

export function MyOrdersPage() {
  return (
    <main className="page page--narrow">
      <ComingSoon
        icon={Package}
        title="Mis pedidos"
        description="Esta sección se activará cuando el backend correspondiente esté disponible."
      />
    </main>
  );
}
