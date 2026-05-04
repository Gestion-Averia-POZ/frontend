import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
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
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const RecoverPassword = lazy(() => import("../pages/auth/RecoverPassword"));
const CompanySuccess = lazy(() => import("../pages/auth/CompanySuccess"));

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

  // Rutas de autenticación — sin NavBar ni Footer
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      { path: ROUTES.LOGIN, element: <Login /> },
      { path: ROUTES.REGISTER, element: <Register /> },
      { path: ROUTES.RECOVER_PASSWORD, element: <RecoverPassword /> },
      { path: ROUTES.COMPANY_SUCCESS, element: <CompanySuccess /> },
    ],
  },

  // Dashboards — con Sidebar
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <DashboardLayout />
      </Suspense>
    ),
    children: [
      { path: "/dashboard/admin", element: <AdminDashboard /> },
      { path: "/dashboard/company", element: <DashboardCompany /> },
      { path: ROUTES.EMPLEADOS, element: <Empleados /> },
      { path: ROUTES.REPORTES, element: <Reportes /> },
      { path: ROUTES.DETALLES_REPORTE, element: <DetallesReporte /> },
      { path: ROUTES.SERVICIOS, element: <Servicios /> },
      { path: ROUTES.DETALLES_SERVICIO, element: <DetallesServicio /> },
      { path: ROUTES.EMPRESAS, element: <Usuarios /> },
      { path: ROUTES.REPORTANTES, element: <Usuarios /> },
      { path: ROUTES.DETALLES_USUARIO, element: <DetallesUsuario /> },
      { path: ROUTES.METRICAS, element: <DetallesMetrica /> },
      { path: ROUTES.DETALLES_METRICA, element: <DetallesMetrica /> },
      { path: ROUTES.TIPOS_AVERIAS, element: <TiposAverias /> },
      { path: ROUTES.SOPORTE, element: <Soporte /> },
      { path: ROUTES.SOLICITUDES, element: <Solicitudes /> },
      { path: "/dashboard/worker", element: <DashboardWorker /> },
      { path: "/dashboard/citizen", element: <DashboardCitizen /> },
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
