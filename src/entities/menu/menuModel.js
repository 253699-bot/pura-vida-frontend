export function normalizeMenuItem(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.id ?? null,
    platilloId: item.platilloId ?? null,
    nombre: item.nombre ?? 'Platillo sin nombre',
    descripcion: item.descripcion ?? '',
    tipoPlatillo: item.tipoPlatillo ?? 'general',
    precio: item.precio ?? 0,
    disponible: Boolean(item.disponible),
  };
}

export function normalizeTodayMenu(menu) {
  return {
    configured: Boolean(menu?.configured),
    fecha: menu?.fecha ?? null,
    items: Array.isArray(menu?.items) ? menu.items.map(normalizeMenuItem).filter(Boolean) : [],
  };
}
