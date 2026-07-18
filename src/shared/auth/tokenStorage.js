const TOKEN_KEY = 'puraVida.auth.token';
const USER_KEY = 'puraVida.auth.user';
export const SESSION_EXPIRED_EVENT = 'puraVida.auth.expired';

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function saveToken(token) {
  if (!canUseLocalStorage() || !token) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  if (!canUseLocalStorage()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveUser(user) {
  if (!canUseLocalStorage() || !user) {
    return;
  }

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
  if (!canUseLocalStorage()) {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function clearSession() {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
