import { resolveApiAssetUrl } from '../../shared/api/assets.js';

export function normalizeMenuItem(item = {}) {
  const dish = item.platillo ?? item.dish ?? {};
  const rawImageUrl = dish.imagenUrl ?? dish.imagen_url ?? dish.imageUrl ?? item.imagenUrl ?? item.imageUrl ?? null;
  const rawPrice = item.precioDia ?? item.precio_dia ?? item.precio ?? item.price
    ?? dish.precioDia ?? dish.precio_dia ?? dish.precio ?? dish.precioBase ?? dish.price ?? 0;

  return {
    id: item.id ?? item.menuItemId ?? item.menu_item_id,
    platilloId: item.platilloId ?? item.dishId ?? dish.id,
    nombre: dish.nombre ?? item.nombre ?? item.name,
    descripcion: dish.descripcion ?? item.descripcion ?? item.description ?? '',
    precio: Number(rawPrice),
    categoria: dish.categoria ?? item.categoria ?? item.category ?? '',
    tipoPlatillo: dish.tipoPlatillo ?? item.tipoPlatillo ?? item.tipo_platillo ?? item.type ?? '',
    publicado: item.publicado ?? item.published ?? true,
    imagenUrl: resolveApiAssetUrl(rawImageUrl),
    imagenVersion: item.imagenVersion ?? item.actualizadoEn ?? item.updatedAt
      ?? dish.imagenVersion ?? dish.actualizadoEn ?? dish.updatedAt ?? null,
    disponible: Boolean(item.disponible ?? item.available ?? true)
  };
}

export function normalizeTodayMenu(menu = {}) {
  const items = menu.items ?? menu.platillos ?? menu.menuItems ?? [];
  return {
    id: menu.id ?? menu.menuId ?? null,
    fecha: menu.fecha ?? menu.date ?? null,
    configured: Boolean(menu.configured ?? menu.configurado ?? menu.id ?? items.length),
    publicado: Boolean(menu.publicado ?? menu.published ?? false),
    items: Array.isArray(items) ? items.map(normalizeMenuItem) : []
  };
}

export function normalizeDish(dish = {}) {
  const rawImageUrl = dish.imagenUrl ?? dish.imagen_url ?? dish.imageUrl ?? dish.fotoUrl ?? null;

  return {
    id: dish.id ?? dish.platilloId ?? dish.Id_platillo,
    nombre: dish.nombre ?? dish.name ?? '',
    descripcion: dish.descripcion ?? dish.description ?? '',
    precio: Number(dish.precio ?? dish.precioBase ?? dish.price ?? 0),
    precioBase: Number(dish.precioBase ?? dish.precio ?? dish.price ?? 0),
    tipoPlatillo: dish.tipoPlatillo ?? dish.tipo_platillo ?? dish.type ?? '',
    categoria: dish.categoria ?? dish.category ?? '',
    activo: Boolean(dish.activo ?? dish.active ?? true),
    imagenUrl: resolveApiAssetUrl(rawImageUrl),
    creadoEn: dish.creadoEn ?? dish.createdAt ?? null,
    actualizadoEn: dish.actualizadoEn ?? dish.updatedAt ?? null
  };
}
