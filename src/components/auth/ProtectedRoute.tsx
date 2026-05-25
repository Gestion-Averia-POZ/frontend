import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES, DASHBOARD_ROUTES, type UserRole } from "../../constants";
import LoadingState from "../ui/LoadingState";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

// Guardia de autenticación + control por rol.
// IMPORTANTE: espera a que termine la restauración de sesión (isLoading)
// antes de redirigir, para no expulsar a un usuario logueado que recarga.
export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingState fullPage message="Cargando…" />;

  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={DASHBOARD_ROUTES[user.role]} replace />;
  }

  return <>{children}</>;
}
