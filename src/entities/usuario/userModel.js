import { USER_ROLES } from '../../shared/constants/roles.js';

export function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id ?? null,
    nombre: user.nombre ?? '',
    correo: user.correo ?? '',
    telefono: user.telefono ?? '',
    rol: user.rol ?? USER_ROLES.CLIENTE,
    iconoPerfil: user.iconoPerfil ?? null,
    activo: user.activo !== false,
  };
}

export function userIsEncargada(user) {
  return normalizeUser(user)?.rol === USER_ROLES.ENCARGADA;
}
