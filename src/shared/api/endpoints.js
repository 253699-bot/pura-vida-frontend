export const ENDPOINTS = {
  HEALTH: '/health',
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  BUSINESS_STATUS_TODAY: '/business/status/today',
  MENU_TODAY: '/menu/today',
  MENU_ITEM_AVAILABILITY: (id) => `/menu/today/items/${id}/availability`,
};
