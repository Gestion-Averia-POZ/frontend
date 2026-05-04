import { api } from "./api";

export interface BackendReport {
  id: string;
  description: string;
  address: string | null;
  priority: "BAJA" | "MEDIA" | "ALTA";
  category: { id: string; name: string };
  failureType: { id: number; name: string; priority: string } | null;
  neighborhood: { id: number; name: string };
  user: { id: string; name: string; lastname: string; email: string };
  company: { id: string; name: string } | null;
  state: { id: number; name: string; colorHex: string };
  assignedManager: {
    id: string;
    name: string;
    lastname: string;
    email: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  latitude?: number;
  longitude?: number;
}

interface UserReportsResponse {
  success: boolean;
  message: string;
  data: {
    reports: BackendReport[];
    count: number;
  };
}

interface SingleReportResponse {
  success: boolean;
  data: { report: BackendReport };
}

interface AllReportsResponse {
  success: boolean;
  message: string;
  data: {
    reports: BackendReport[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

export interface CreateReportBody {
  description: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  companyId?: string;
  failureTypeId?: number;
  address?: string;
}

export interface AddressResult {
  street?: string;
  formatted?: string;
  neighborhood?: string;
  quarter?: string;
  village?: string;
}

interface GetAddressResponse {
  success: boolean;
  data: { address: AddressResult };
}

export interface ExportFilters {
  neighborhoodName?: string;
  failureTypeName?: string;
  categoryName?: string;
  stateName?: string;
  companyName?: string;
  priority?: 'BAJA' | 'MEDIA' | 'ALTA';
  reportState?: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
}

export const reportsService = {
  getByUser: (userId: string) =>
    api.get<UserReportsResponse>(`/api/reports/user/${userId}`),

  getById: (reportId: string) =>
    api.get<SingleReportResponse>(`/api/reports/${reportId}`),

  create: (body: CreateReportBody) =>
    api.post<SingleReportResponse>(`/api/reports`, body),

  getAddress: (latitude: number, longitude: number) =>
    api.post<GetAddressResponse>(`/api/reports/get-address`, { latitude, longitude }),

  updateStatus: (reportId: string, stateName: "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO") =>
    api.patch<{ success: boolean; message: string; data: { report: BackendReport } }>(
      `/api/reports/${reportId}/status`,
      { stateName }
    ),

  update: (reportId: string, body: { description?: string; failureTypeId?: number }) =>
    api.patch<SingleReportResponse>(`/api/reports/${reportId}`, body),

  getAssigned: () =>
    api.get<UserReportsResponse>("/api/reports/assigned"),

  getAll: (params?: { categoryName?: string; limit?: number; assignedManagerId?: string }) => {
    const limit = params?.limit ?? 1000;
    const cat = params?.categoryName ? `&categoryName=${encodeURIComponent(params.categoryName)}` : "";
    const manager = params?.assignedManagerId ? `&assignedManagerId=${encodeURIComponent(params.assignedManagerId)}` : "";
    return api.get<AllReportsResponse>(`/api/reports?limit=${limit}${cat}${manager}`);
  },

  assign: (reportId: string, workerId: string) =>
    api.patch<SingleReportResponse>(`/api/reports/${reportId}/assign`, { workerId }),

  exportToExcel: async (filters: ExportFilters): Promise<void> => {
    const res = await api.postBlob('/api/reports/export', filters);
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reportes-averias.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
