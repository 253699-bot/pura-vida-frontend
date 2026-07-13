export function ErrorMessage({ title = 'Algo salio mal', message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="message message--error" role="alert">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}
