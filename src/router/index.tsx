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

// Dashboards por rol
const AdminDashboard = lazy(
  () => import("../pages/type-users/admin/AdminDashboard"),
);
const Reportes = lazy(() => import("../pages/Reportes"));
const DetallesReporte = lazy(() => import("../pages/DetallesReporte"));

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
      { path: ROUTES.REPORTES, element: <Reportes /> },
      { path: ROUTES.DETALLES_REPORTE, element: <DetallesReporte /> },
      // { path: "/dashboard/supervisor", element: <SupervisorDashboard /> },
      // { path: "/dashboard/worker",     element: <WorkerDashboard /> },
      // { path: "/dashboard/citizen",    element: <CitizenDashboard /> },
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
