import { getApiData } from '../../shared/api/apiResponse.js';
import { ENDPOINTS } from '../../shared/api/endpoints.js';
import { httpClient } from '../../shared/api/httpClient.js';

export async function getWeeklyReportSummary(weekStart) {
  const response = await httpClient.get(ENDPOINTS.ADMIN_WEEKLY_REPORT_SUMMARY, {
    params: { weekStart },
  });

  return getApiData(response);
}

export async function downloadWeeklyReportPdf(weekStart) {
  return httpClient.get(ENDPOINTS.ADMIN_WEEKLY_REPORT_PDF, {
    params: { weekStart },
    responseType: 'blob',
  });
}
