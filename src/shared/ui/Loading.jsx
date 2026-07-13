export function Loading({ label = 'Cargando...' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading__dot" />
      {label}
    </div>
  );
}
