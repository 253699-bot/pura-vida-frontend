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

function normalizeStoredReport(report) {
  if (!report) return null;

  return {
    id: report.id ?? null,
    semanaInicio: report.semanaInicio ?? null,
    semanaFin: report.semanaFin ?? null,
    totalPedidosApp: Number(report.totalPedidosApp || 0),
    totalIngresos: Number(report.totalIngresos || 0),
    platilloMasVendidoId: report.platilloMasVendidoId ?? null,
    diaMayorDemanda: report.diaMayorDemanda ?? null,
    versionFormato: report.versionFormato ?? null,
    generadoPor: report.generadoPor ?? null,
    generadoEn: report.generadoEn ?? null,
    snapshotDisponible: Boolean(report.snapshotDisponible),
  };
}

export async function listWeeklyReports() {
  const response = await httpClient.get(ENDPOINTS.ADMIN_WEEKLY_REPORTS);
  const reports = getApiData(response);

  return Array.isArray(reports) ? reports.map(normalizeStoredReport).filter(Boolean) : [];
}

export async function createWeeklyReport(weekStart) {
  const response = await httpClient.post(ENDPOINTS.ADMIN_WEEKLY_REPORTS, { weekStart });

  return normalizeStoredReport(getApiData(response));
}

export async function downloadStoredWeeklyReportPdf(reportId) {
  return httpClient.get(ENDPOINTS.ADMIN_WEEKLY_REPORT_PERSISTED_PDF(reportId), {
    responseType: 'blob',
  });
}
