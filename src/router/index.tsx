import { lazy, Suspense } from "react";
import { createBrowserRouter, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicOnlyRoute from "../components/auth/PublicOnlyRoute";
import { ROUTES } from "../constants";

// ─────────────────────────────────────────────
// PÁGINAS — carga diferida (lazy)
// Cada import() genera un chunk JS separado.
// El navegador solo descarga ese chunk cuando
// el usuario navega a esa ruta por primera vez.
// ─────────────────────────────────────────────

// Rutas públicas
const Home = lazy(() => import("../pages/Home"));
const Metrics = lazy(() => import("../pages/Metrics"));
const Privacy = lazy(() => import("../pages/Privacy"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Rutas de autenticación
const Login = lazy(() => import("../pages/Auth/Login"));
const Register = lazy(() => import("../pages/Auth/Register"));
const RecoverPassword = lazy(() => import("../pages/Auth/RecoverPassword"));
const CompanySuccess = lazy(() => import("../pages/Auth/CompanySuccess"));

// Dashboards por rol
const AdminDashboard = lazy(
  () => import("../pages/type-users/admin/AdminDashboard"),
);
const DashboardCompany = lazy(
  () => import("../pages/type-users/company/DashboardCompany"),
);
const Empleados = lazy(() => import("../pages/Empleados"));
const Reportes = lazy(() => import("../pages/Reportes"));
const DetallesReporte = lazy(() => import("../pages/DetallesReporte"));
const Servicios = lazy(() => import("../pages/Servicios"));
const DetallesServicio = lazy(() => import("../pages/DetallesServicio"));
const Usuarios = lazy(() => import("../pages/Usuarios"));
const ReportantesEmpresa = lazy(() => import("../pages/ReportantesEmpresa"));
const DetallesUsuario = lazy(() => import("../pages/DetallesUsuario"));
const DetallesMetrica = lazy(() => import("../pages/DetallesMetrica"));
const TiposAverias = lazy(() => import("../pages/TiposAverias"));
const Soporte = lazy(() => import("../pages/Soporte"));
const Solicitudes = lazy(() => import("../pages/Solicitudes"));
const DashboardWorker = lazy(
  () => import("../pages/type-users/worker/DashboardWorker"),
);
const DashboardCitizen = lazy(
  () => import("../pages/type-users/citizen/DashboardCitizen"),
);

// ─────────────────────────────────────────────
// FALLBACK DE CARGA
// Se muestra mientras el chunk de la página
// se está descargando desde el servidor.
// ─────────────────────────────────────────────

function DetallesUsuarioKeyed() {
  const { key } = useLocation();
  return <DetallesUsuario key={key} />;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );
}

// ─────────────────────────────────────────────
// ROUTER
// Los layouts NO son lazy: son estructurales y
// siempre están presentes. Solo las páginas
// (hijos del Outlet) se cargan bajo demanda.
//
// Suspense se coloca en el layout para que
// capture la carga de cualquier hijo lazy.
// ─────────────────────────────────────────────

export const router = createBrowserRouter([
  // Rutas públicas — con NavBar y Footer
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <MainLayout />
      </Suspense>
    ),
    children: [
      { path: ROUTES.HOME, element: <Home /> },
      { path: ROUTES.METRICS, element: <Metrics /> },
      { path: ROUTES.PRIVACY, element: <Privacy /> },
    ],
  },

  // Rutas de autenticación — sin NavBar ni Footer.
  // PublicOnlyRoute redirige al dashboard si ya hay sesión activa.
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicOnlyRoute>
          <AuthLayout />
        </PublicOnlyRoute>
      </Suspense>
    ),
    children: [
      { path: ROUTES.LOGIN, element: <Login /> },
      { path: ROUTES.REGISTER, element: <Register /> },
      { path: ROUTES.RECOVER_PASSWORD, element: <RecoverPassword /> },
      { path: ROUTES.COMPANY_SUCCESS, element: <CompanySuccess /> },
    ],
  },

  // Dashboards — con Sidebar.
  // El ProtectedRoute exterior exige autenticación para TODOS los hijos;
  // el ProtectedRoute interior (allowedRoles) aplica el control por rol.
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      {
        path: "/dashboard/admin",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/company",
        element: (
          <ProtectedRoute allowedRoles={["company"]}>
            <DashboardCompany />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/worker",
        element: (
          <ProtectedRoute allowedRoles={["worker"]}>
            <DashboardWorker />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/citizen",
        element: (
          <ProtectedRoute allowedRoles={["citizen"]}>
            <DashboardCitizen />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.EMPLEADOS,
        element: (
          <ProtectedRoute allowedRoles={["admin", "company"]}>
            <Empleados />
          </ProtectedRoute>
        ),
      },
      // Reportes y su detalle — accesibles para todos los roles autenticados
      { path: ROUTES.REPORTES, element: <Reportes /> },
      { path: ROUTES.DETALLES_REPORTE, element: <DetallesReporte /> },
      {
        path: ROUTES.SERVICIOS,
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Servicios />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DETALLES_SERVICIO,
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <DetallesServicio />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.EMPRESAS,
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Usuarios />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.REPORTANTES,
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Usuarios />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.REPORTANTES_EMPRESA,
        element: (
          <ProtectedRoute allowedRoles={["company"]}>
            <ReportantesEmpresa />
          </ProtectedRoute>
        ),
      },
      // Mi cuenta — accesible para todos los roles autenticados
      { path: ROUTES.DETALLES_USUARIO, element: <DetallesUsuarioKeyed /> },
      {
        path: ROUTES.METRICAS,
        element: (
          <ProtectedRoute allowedRoles={["admin", "company", "worker"]}>
            <DetallesMetrica />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DETALLES_METRICA,
        element: (
          <ProtectedRoute allowedRoles={["admin", "company", "worker"]}>
            <DetallesMetrica />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.TIPOS_AVERIAS,
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <TiposAverias />
          </ProtectedRoute>
        ),
      },
      // Soporte — accesible para todos los roles autenticados
      { path: ROUTES.SOPORTE, element: <Soporte /> },
      {
        path: ROUTES.SOLICITUDES,
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Solicitudes />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Ruta 404 — sin layout
  {
    path: "*",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
]);
