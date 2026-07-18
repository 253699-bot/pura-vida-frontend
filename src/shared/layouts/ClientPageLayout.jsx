import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ClientPageLayout.css';

export function ClientPageLayout({
  title,
  description,
  backTo = '/',
  backLabel = 'Volver al inicio',
  actions,
  children,
  className = '',
}) {
  return (
    <div className={`client-view ${className}`.trim()}>
      <main className="client-view__main">
        <header className="client-view__header">
          <div className="client-view__heading">
            <Link className="client-view__back" to={backTo}>
              <ArrowLeft size={19} strokeWidth={2.2} aria-hidden="true" />
              {backLabel}
            </Link>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="client-view__actions">{actions}</div> : null}
        </header>
        {children}
      </main>

      <footer className="client-view__footer">
        © PuraVida · Suchiapa, Chiapas. Sabor local y fresco.
      </footer>
    </div>
  );
}
