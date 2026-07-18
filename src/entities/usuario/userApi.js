import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { httpClient } from '../../shared/api/httpClient.js';
import { normalizeUser } from './userModel.js';

export async function login(credentials) {
  const response = await httpClient.post(ENDPOINTS.AUTH_LOGIN, credentials);
  const authData = getApiData(response);

  return {
    ...authData,
    user: normalizeUser(authData?.user),
  };
}

export async function register(payload) {
  const response = await httpClient.post(ENDPOINTS.AUTH_REGISTER, payload);

  return normalizeUser(getApiData(response));
}

export async function getMyProfile() {
  const response = await httpClient.get(ENDPOINTS.ME);

  return normalizeUser(getApiData(response));
}

export async function updateMyProfile(payload) {
  const response = await httpClient.patch(ENDPOINTS.ME, payload);

  return normalizeUser(getApiData(response));
}
