import { resolveApiAssetUrl } from '../../shared/api/assets.js';

export function normalizeCartItem(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.id ?? null,
    dishId: item.dishId ?? null,
    nombre: item.nombre ?? 'Platillo sin nombre',
    cantidad: Number(item.cantidad || 0),
    precioUnitario: Number(item.precioUnitario || 0),
    subtotal: Number(item.subtotal || 0),
    imagenUrl: resolveApiAssetUrl(item.imagenUrl),
  };
}

export function normalizeCart(cart) {
  const items = Array.isArray(cart?.items)
    ? cart.items.map(normalizeCartItem).filter(Boolean)
    : [];

  return {
    items,
    total: Number(cart?.total || 0),
  };
}