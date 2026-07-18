import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';
import {
  clearSession,
  getToken,
  SESSION_EXPIRED_EVENT,
} from '../auth/tokenStorage.js';
import { normalizeApiError } from './apiResponse.js';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);
