export const ROUTES = {
  HOME: "/",
  METRICS: "/metrics",
  PRIVACY: "/privacy",
  LOGIN: "/login",
  REGISTER: "/register",
  RECOVER_PASSWORD: "/recover-password",
  REPORTES: "/reportes",
} as const;

export const APP_NAME = "Urbis";

// ─────────────────────────────────────────────
// USUARIOS MOCK — solo para desarrollo
// Reemplazar por llamadas al backend cuando
// los endpoints estén disponibles.
// ─────────────────────────────────────────────

export type UserRole = "admin" | "supervisor" | "worker" | "citizen";

export const MOCK_USERS = [
  {
    email: "admin@ejemplo.com",
    password: "admin",
    role: "admin" as UserRole,
    name: "Administrador",
  },
  {
    email: "supervisor@urbis.com",
    password: "super123",
    role: "supervisor" as UserRole,
    name: "Supervisor",
  },
  {
    email: "worker@urbis.com",
    password: "worker123",
    role: "worker" as UserRole,
    name: "Trabajador",
  },
  {
    email: "citizen@urbis.com",
    password: "citizen123",
    role: "citizen" as UserRole,
    name: "Ciudadano",
  },
] as const;

// Ruta de dashboard según el rol del usuario
export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: "/dashboard/admin",
  supervisor: "/dashboard/supervisor",
  worker: "/dashboard/worker",
  citizen: "/dashboard/citizen",
};
