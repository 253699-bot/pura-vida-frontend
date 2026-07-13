import { useMemo, useState } from 'react';
import { login as loginUser, register as registerUser } from '../../entities/usuario/userApi.js';
import { normalizeUser, userIsEncargada } from '../../entities/usuario/userModel.js';
import {
  clearSession,
  getStoredUser,
  getToken,
  saveToken,
  saveUser,
} from '../../shared/auth/tokenStorage.js';
import { AuthContext } from '../../shared/hooks/useAuth.js';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => normalizeUser(getStoredUser()));

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

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isEncargada: userIsEncargada(user),
      login,
      register,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
