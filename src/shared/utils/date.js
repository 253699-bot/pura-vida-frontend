export function formatDate(value) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
