export const ROUTES = {
  HOME: "/",
  METRICS: "/metrics",
  PRIVACY: "/privacy",
  LOGIN: "/login",
  REGISTER: "/register",
  RECOVER_PASSWORD: "/recover-password",
  REPORTES: "/reportes",
  DETALLES_REPORTE: "/reportes/detalles-reporte",
  SERVICIOS: "/servicios",
  DETALLES_SERVICIO: "/servicios/detalles-servicio",
  EMPLEADOS: "/empleados",
  EMPRESAS: "/usuarios/empresas",
  REPORTANTES: "/usuarios/reportantes",
  DETALLES_USUARIO: "/usuarios/detalles-usuario",
  METRICAS: "/metricas",
  DETALLES_METRICA: "/metricas/detalles",
  TIPOS_AVERIAS: "/tipos-averias",
} as const;

// Ruta de dashboard según el rol del usuario
export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: "/dashboard/admin",
  company: "/dashboard/company",
  worker: "/dashboard/worker",
  citizen: "/dashboard/citizen",
};

export const APP_NAME = "Urbis";

// ─────────────────────────────────────────────
// USUARIOS MOCK — solo para desarrollo
// Reemplazar por llamadas al backend cuando
// los endpoints estén disponibles.
// ─────────────────────────────────────────────

export type UserRole = "admin" | "company" | "worker" | "citizen";

export const MOCK_USERS = [
  {
    email: "admin@ejemplo.com",
    password: "admin",
    role: "admin" as UserRole,
    name: "Administrador",
  },
  {
    email: "company@ejemplo.com",
    password: "admin",
    role: "company" as UserRole,
    name: "company",
  },
  {
    email: "worker@ejemplo.com",
    password: "admin",
    role: "worker" as UserRole,
    name: "worker",
  },
  {
    email: "citizen@ejemplo.com",
    password: "admin",
    role: "citizen" as UserRole,
    name: "reportante",
  },
] as const;
