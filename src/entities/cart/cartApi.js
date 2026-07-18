import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { httpClient } from '../../shared/api/httpClient.js';
import { normalizeOrder } from '../orders/orderModel.js';
import { normalizeCart, normalizeCartItem } from './cartModel.js';

export async function getCart() {
  const response = await httpClient.get(ENDPOINTS.CART);

  return normalizeCart(getApiData(response));
}

export async function addCartItem(dishId, cantidad) {
  const response = await httpClient.post(ENDPOINTS.CART_ITEMS, { dishId, cantidad });

  return normalizeCartItem(getApiData(response));
}

export async function updateCartItemQuantity(cartItemId, cantidad) {
  const response = await httpClient.patch(ENDPOINTS.CART_ITEM(cartItemId), { cantidad });

  return normalizeCartItem(getApiData(response));
}

export async function deleteCartItem(cartItemId) {
  await httpClient.delete(ENDPOINTS.CART_ITEM(cartItemId));
}

export async function checkoutCart() {
  const response = await httpClient.post(ENDPOINTS.CART_CHECKOUT);

  return normalizeOrder(getApiData(response));
}
