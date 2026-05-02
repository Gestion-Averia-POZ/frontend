import { api } from "./api";

export type BackendRole = "ADMIN" | "COMPANY" | "WORKER" | "CITIZEN";

interface BackendUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: BackendRole;
  isActive: boolean;
}

export interface BackendUserProfile {
  id: string;
  name: string;
  lastname: string;
  email: string;
  phoneNumber: string | null;
  role: BackendRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
};
