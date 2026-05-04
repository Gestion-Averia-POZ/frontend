import { api } from './api';

export interface SolicitudRequest {
  id: string;
  applicantName: string;
  type: 'REGISTRO' | 'DUDA' | 'BUG';
  description: string;
  createdAt: string;
  state: { id: number; name: string; colorHex?: string };
  user?: { name: string; lastname: string; email: string };
}

interface CreateRequestBody {
  applicantName: string;
  type: string;
  description: string;
}

export const requestsService = {
  create: (body: CreateRequestBody): Promise<SolicitudRequest> =>
    api
      .post<{ success: boolean; data: { request: SolicitudRequest } }>(
        '/api/requests',
        body
      )
      .then((res) => res.data.request),

  getAll: (): Promise<SolicitudRequest[]> =>
    api
      .get<{ success: boolean; data: { requests: SolicitudRequest[] } }>(
        '/api/requests'
      )
      .then((res) => res.data.requests),

  updateState: (id: string, state: string): Promise<SolicitudRequest> =>
    api
      .patch<{ success: boolean; data: { request: SolicitudRequest } }>(
        `/api/requests/${id}/state`,
        { state }
      )
      .then((res) => res.data.request),
};
