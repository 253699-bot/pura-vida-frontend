import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';
import { getToken } from '../auth/tokenStorage.js';
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
  (error) => Promise.reject(normalizeApiError(error)),
);
