import axios from "axios";
import { API_URL } from "../config";

const TOKEN_KEY = "urbis_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Adjunta el JWT en cada request si existe en localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normaliza los errores: si hay array `errors` usa sus mensajes, si no usa `message`
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error.response?.data;
    const errors: { field: string; message: string }[] = data?.errors ?? [];
    const message = errors.length > 0
      ? errors.map((e) => e.message).join(" • ")
      : (data?.message ?? error.message ?? "Error en la solicitud");
    return Promise.reject(new Error(message));
  }
);

export const api = {
  get: <T>(path: string) =>
    axiosInstance.get<T>(path).then((res) => res.data),
  post: <T>(path: string, body: unknown) =>
    axiosInstance.post<T>(path, body).then((res) => res.data),
  patch: <T>(path: string, body: unknown) =>
    axiosInstance.patch<T>(path, body).then((res) => res.data),
  delete: <T>(path: string) =>
    axiosInstance.delete<T>(path).then((res) => res.data),
  postBlob: (path: string, body: unknown) =>
    axiosInstance.post(path, body, { responseType: 'blob' }),
};
