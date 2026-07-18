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

export function formatTime(value) {
  if (!value) {
    return 'Sin hora';
  }

  const [hours = 0, minutes = 0] = String(value).split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);

  return new Intl.DateTimeFormat('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatOrderDate(fecha, hora) {
  if (!fecha) {
    return 'Fecha no disponible';
  }

  return `${formatDate(fecha)}${hora ? `, ${formatTime(hora)}` : ''}`;
}

export function getOrderDateTimeValue(fecha, hora) {
  if (!fecha) {
    return undefined;
  }

  return `${fecha}T${hora || '00:00:00'}`;
}
