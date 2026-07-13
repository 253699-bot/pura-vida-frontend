export function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}
