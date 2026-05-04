import { api } from "./api";

interface CreateSolicitudPayload {
  applicantName: string;
  type: "REGISTRO";
  description: string;
}

export const solicitudesService = {
  create: (payload: CreateSolicitudPayload) =>
    api.post<{ id: string }>("/api/requests/public", payload),
};
