import { api } from "./api";

export type BackendRole = "ADMIN" | "COMPANY" | "WORKER" | "CITIZEN";

interface BackendUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: BackendRole;
  isActive: boolean;
  company?: { id: string; name: string } | null;
}

export interface BackendUserProfile {
  id: string;
  name: string;
  lastname: string;
  email: string;
  phoneNumber: string | null;
  role: BackendRole;
  company?: { id: string; name: string } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GetUsersResponse {
  success: boolean;
  data: {
    users: BackendUserProfile[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

interface CreateEmployeeResponse {
  success: boolean;
  message: string;
  data: { employee: BackendUserProfile };
}

interface GetUserResponse {
  success: boolean;
  data: { user: BackendUserProfile };
}

interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: { user: BackendUserProfile };
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
    token: string;
  };
}

interface OTPResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expiresIn?: string;
    purpose?: string;
    verified?: boolean;
  };
}

interface CheckEmailResponse {
  success: boolean;
  data: { exists: boolean };
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/api/auth/login", { email, password }),

  register: (data: {
    name: string;
    lastname: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }) => api.post<AuthResponse>("/api/auth/register", data),

  checkEmail: (email: string) =>
    api.get<CheckEmailResponse>(
      `/api/auth/check-email/${encodeURIComponent(email)}`
    ),

  sendRegisterOTP: (email: string) =>
    api.post<OTPResponse>("/api/otp/send-register", { email }),

  sendResetPasswordOTP: (email: string) =>
    api.post<OTPResponse>("/api/otp/send-reset-password", { email }),

  verifyOTP: (
    email: string,
    code: string,
    purpose: "register" | "reset-password"
  ) => api.post<OTPResponse>("/api/otp/verify", { email, code, purpose }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    api.post<OTPResponse>("/api/otp/reset-password", {
      email,
      code,
      newPassword,
    }),

  getUserById: (id: string) =>
    api.get<GetUserResponse>(`/api/auth/user/${id}`),

  updateUser: (
    id: string,
    data: { name?: string; lastname?: string; email?: string; phoneNumber?: string }
  ) => api.patch<UpdateUserResponse>(`/api/auth/user/${id}`, data),

  getUsers: (params?: { role?: string; companyName?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set("role", params.role);
    if (params?.companyName) searchParams.set("companyName", params.companyName);
    searchParams.set("limit", String(params?.limit ?? 100));
    return api.get<GetUsersResponse>(`/api/auth/users?${searchParams.toString()}`);
  },

  createEmployee: (data: {
    name: string;
    lastname: string;
    email: string;
    password: string;
    companyId: string;
    phoneNumber?: string;
  }) => api.post<CreateEmployeeResponse>("/api/users/employee", data),

  activateWorker: (id: string) =>
    api.patch(`/api/auth/worker/${id}/activate`, {}),

  deactivateWorker: (id: string) =>
    api.patch(`/api/auth/worker/${id}/deactivate`, {}),

  // Admin-only: manage any user
  activateUser: (id: string) =>
    api.patch(`/api/auth/user/${id}/activate`, {}),

  deactivateUser: (id: string) =>
    api.patch(`/api/auth/user/${id}/deactivate`, {}),

  deleteUser: (id: string) =>
    api.delete(`/api/auth/user/${id}`),

  createCompanyUser: (data: {
    name: string;
    lastname: string;
    email: string;
    password: string;
    companyId?: string;
    phoneNumber?: string;
  }) => api.post<CreateEmployeeResponse>("/api/users/company", data),
};
