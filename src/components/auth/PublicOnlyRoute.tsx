import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DASHBOARD_ROUTES } from "../../constants";
import LoadingState from "../ui/LoadingState";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

// Evita que un usuario ya autenticado vea páginas públicas de auth
// (login, register, recuperar contraseña): lo redirige a su dashboard.
export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingState fullPage message="Cargando…" />;

  if (user) return <Navigate to={DASHBOARD_ROUTES[user.role]} replace />;

  return <>{children}</>;
}
