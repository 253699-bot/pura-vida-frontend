import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { getApiData } from '../../shared/api/apiResponse.js';
import { httpClient } from '../../shared/api/httpClient.js';
import { normalizeNotification } from './notificationModel.js';

export async function getMyNotifications() {
  const response = await httpClient.get(ENDPOINTS.NOTIFICATIONS);
  const data = getApiData(response);

  return Array.isArray(data) ? data.map(normalizeNotification).filter(Boolean) : [];
}

export async function markNotificationRead(notificationId) {
  const response = await httpClient.patch(ENDPOINTS.NOTIFICATION_READ(notificationId));

  return normalizeNotification(getApiData(response));
}

export async function markAllNotificationsRead() {
  const response = await httpClient.patch(ENDPOINTS.NOTIFICATIONS_READ_ALL);

  return getApiData(response)?.actualizadas ?? 0;
}
