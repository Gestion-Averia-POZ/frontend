import { api } from './api';

export interface MetricsByStatus {
  state: string;
  count: number;
}

export interface MetricsTopFailure {
  type: string;
  count: number;
}

export interface MetricsByPriority {
  priority: string;
  count: number;
}

export interface MetricsCriticalSector {
  sector: string;
  count: number;
}

export interface MetricsData {
  byStatus: MetricsByStatus[];
  topFailureTypes: MetricsTopFailure[];
  byPriority: MetricsByPriority[];
  resolutionRate: number;
  criticalSectors: MetricsCriticalSector[];
}

interface MetricsResponse {
  success: boolean;
  message: string;
  data: MetricsData;
}

export interface MetricsParams {
  startDate?: string;
  endDate?: string;
}

export const metricsService = {
  getMetrics: (params?: MetricsParams): Promise<MetricsResponse> => {
    const qs = new URLSearchParams();
    if (params?.startDate) qs.set('startDate', params.startDate);
    if (params?.endDate) qs.set('endDate', params.endDate);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return api.get<MetricsResponse>(`/api/reports/metrics${query}`);
  },
};
