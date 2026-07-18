import { useCallback, useEffect, useMemo, useState } from 'react';
import { login as loginUser, register as registerUser } from '../../entities/usuario/userApi.js';
import { normalizeUser, userIsEncargada } from '../../entities/usuario/userModel.js';
import {
  clearSession,
  getStoredUser,
  getToken,
  saveToken,
  saveUser,
  SESSION_EXPIRED_EVENT,
} from '../../shared/auth/tokenStorage.js';
import { AuthContext } from '../../shared/hooks/useAuth.js';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => normalizeUser(getStoredUser()));

  useEffect(() => {
    function handleSessionExpired() {
      setToken(null);
      setUser(null);
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  async function login(credentials) {
    const authData = await loginUser(credentials);

    if (!authData?.token || !authData?.user) {
      throw new Error('La respuesta de inicio de sesion no incluye una sesion valida.');
    }

    saveToken(authData.token);
    saveUser(authData.user);
    setToken(authData.token);
    setUser(authData.user);

    return authData;
  }

  async function register(payload) {
    return registerUser(payload);
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  const updateUser = useCallback((nextUser) => {
    const normalizedUser = normalizeUser(nextUser);

    if (!normalizedUser) {
      return;
    }

    saveUser(normalizedUser);
    setUser(normalizedUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isEncargada: userIsEncargada(user),
      login,
      register,
      logout,
      updateUser,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
