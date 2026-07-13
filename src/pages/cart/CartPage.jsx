import { ShoppingCart } from 'lucide-react';
import { ComingSoon } from '../../shared/ui/ComingSoon.jsx';

export function CartPage() {
  return (
    <main className="page page--narrow">
      <ComingSoon
        icon={ShoppingCart}
        title="Carrito"
        description="Esta sección se activará cuando el backend correspondiente esté disponible."
      />
    </main>
  );
}
