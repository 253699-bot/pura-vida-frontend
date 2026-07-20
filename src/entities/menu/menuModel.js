import { resolveApiAssetUrl } from '../../shared/api/assets.js';

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
    imagenUrl: resolveApiAssetUrl(item.imagenUrl),
    disponible: Boolean(item.disponible),
    publicado: item.publicado !== false,
  };
}

<<<<<<< Updated upstream
=======
export function normalizeDish(dish) {
  if (!dish) {
    return null;
  }

  return {
    id: dish.id ?? null,
    nombre: dish.nombre ?? 'Platillo sin nombre',
    descripcion: dish.descripcion ?? '',
    tipoPlatillo: dish.tipoPlatillo ?? 'platillo_fuerte',
    precioBase: Number(dish.precioBase || 0),
    imagenUrl: resolveApiAssetUrl(dish.imagenUrl),
    activo: Boolean(dish.activo),
    creadoEn: dish.creadoEn ?? null,
    actualizadoEn: dish.actualizadoEn ?? null,
  };
}

>>>>>>> Stashed changes
export function normalizeTodayMenu(menu) {
  return {
    configured: Boolean(menu?.configured),
    fecha: menu?.fecha ?? null,
    items: Array.isArray(menu?.items) ? menu.items.map(normalizeMenuItem).filter(Boolean) : [],
  };
}
