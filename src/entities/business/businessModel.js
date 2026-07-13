export function normalizeBusinessStatus(status) {
  if (!status) {
    return {
      configured: false,
      id: null,
      fecha: null,
      abierto: null,
      motivoCierre: '',
      registradoPor: null,
      creadoEn: null,
      actualizadoEn: null,
    };
  }

  return {
    configured: Boolean(status.configured),
    id: status.id ?? null,
    fecha: status.fecha ?? null,
    abierto: status.abierto ?? null,
    motivoCierre: status.motivoCierre ?? '',
    registradoPor: status.registradoPor ?? null,
    creadoEn: status.creadoEn ?? null,
    actualizadoEn: status.actualizadoEn ?? null,
  };
}

export function getBusinessStatusLabel(status) {
  const normalizedStatus = normalizeBusinessStatus(status);

  if (!normalizedStatus.configured || normalizedStatus.abierto === null) {
    return 'Sin configurar';
  }

  return normalizedStatus.abierto ? 'Abierto hoy' : 'Cerrado hoy';
}
