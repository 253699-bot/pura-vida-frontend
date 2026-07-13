const DEFAULT_API_BASE_URL = 'http://localhost:8080/api/v1';

function normalizeBaseUrl(value) {
  return value?.trim().replace(/\/+$/, '') || DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const env = {
  apiBaseUrl: API_BASE_URL,
};
