const DEFAULT_ERROR_MESSAGE = 'No se pudo completar la solicitud.';

export function getApiData(response) {
  if (response && typeof response === 'object' && 'data' in response && 'status' in response) {
    return response.data;
  }

  return response;
}

export function getApiMessage(errorLike, fallback = DEFAULT_ERROR_MESSAGE) {
  if (!errorLike) {
    return fallback;
  }

  if (typeof errorLike === 'string') {
    return errorLike;
  }

  return errorLike.message || errorLike.data?.message || fallback;
}

export function getApiErrors(errorLike) {
  if (!errorLike || typeof errorLike !== 'object') {
    return {};
  }

  return errorLike.errors || errorLike.data?.errors || {};
}

export function normalizeApiError(error) {
  const backendError = error?.response?.data;

  return {
    status: backendError?.status || 'ERROR',
    message: backendError?.message || error?.message || DEFAULT_ERROR_MESSAGE,
    errors: backendError?.errors || {},
    httpStatus: error?.response?.status || null,
  };
}
