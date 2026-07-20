import { useEffect, useRef } from 'react';
import { LogOut, X } from 'lucide-react';
import { Button } from '../../../shared/ui/Button.jsx';
import './LogoutConfirmationDialog.css';

export function LogoutConfirmationDialog({ open, isWorking = false, onCancel, onConfirm }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel?.querySelector('button:not(:disabled)')?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!isWorking) onCancel?.();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWorking, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="logout-confirmation" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isWorking) onCancel?.(); }}>
      <section
        ref={panelRef}
        className="logout-confirmation__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirmation-title"
        aria-describedby="logout-confirmation-description"
      >
        <button type="button" className="logout-confirmation__close" aria-label="Cerrar" disabled={isWorking} onClick={onCancel}>
          <X size={20} aria-hidden="true" />
        </button>
        <span className="logout-confirmation__icon" aria-hidden="true">
          <LogOut size={34} strokeWidth={2.2} />
        </span>
        <h2 id="logout-confirmation-title">¿Seguro que deseas cerrar sesión?</h2>
        <p id="logout-confirmation-description">
          Se cerrará tu sesión en este dispositivo y volverás a la página principal.
        </p>
        <div className="logout-confirmation__actions">
          <Button type="button" variant="secondary" disabled={isWorking} onClick={onCancel}>Cancelar</Button>
          <Button type="button" variant="danger" disabled={isWorking} onClick={onConfirm}>
            {isWorking ? 'Cerrando...' : 'Cerrar sesión'}
          </Button>
        </div>
      </section>
    </div>
  );
}