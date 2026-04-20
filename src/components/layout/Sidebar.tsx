import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  FileBarChart2,
  Users,
  ChevronRight,
  Building2,
  UserPlus,
  BarChart2,
  UserCircle,
  PanelRightClose,
  LogOut,
  Wrench,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROUTES, DASHBOARD_ROUTES } from "../../constants";

const TEXT = "#94A3B8";
const BG = "#25244E";
const ACTIVE_COLOR = "#FFFFFF";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick?: () => void;
  isActive?: boolean;
  indent?: boolean;
  rightElement?: React.ReactNode;
  collapsed?: boolean;
  color?: string;
}

function NavItem({
  icon,
  label,
  badge,
  onClick,
  isActive,
  indent,
  rightElement,
  collapsed,
  color,
}: NavItemProps) {
  const itemColor = color ?? TEXT;

  const activeColor = isActive ? ACTIVE_COLOR : itemColor;

  return (
    <li>
      <button
        onClick={onClick}
        title={collapsed ? label : undefined}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/10"
        style={{
          color: activeColor,
          cursor: "pointer",
          paddingLeft: indent && !collapsed ? "2.5rem" : undefined,
          backgroundColor: isActive ? "#2D5BFF" : undefined,
          justifyContent: collapsed ? "center" : undefined,
        }}
      >
        <span className="shrink-0" style={{ color: activeColor }}>
          {icon}
        </span>

        {/* Label, badge and right element fade out when collapsed */}
        <span
          className="flex items-center flex-1 min-w-0 overflow-hidden"
          style={{
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : "100%",
            transition: "opacity 0.25s ease, max-width 0.25s ease",
            pointerEvents: collapsed ? "none" : undefined,
          }}
        >
          <span className="flex-1 text-left whitespace-nowrap">{label}</span>
          {badge && (
            <span
              className="text-xs font-medium ml-auto"
              style={{ color: TEXT }}
            >
              +{badge}
            </span>
          )}
          {rightElement}
        </span>
      </button>
    </li>
  );
}

export default function Sidebar() {
  const [usuariosOpen, setUsuariosOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isCompany = user?.role === "company";
  const isCitizen = user?.role === "citizen";
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const navState = location.state as { tipo?: string; origen?: string; mode?: string } | null;
  const dashboardRoute = user ? DASHBOARD_ROUTES[user.role] : "/dashboard";

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN);
  }

  // Estimated height of 3 sub-items (each ~36px) + spacing
  const submenuMaxHeight = "160px";

  return (
    <div
      className="flex flex-col h-screen shrink-0 py-4 px-3 overflow-hidden"
      style={{
        backgroundColor: BG,
        width: collapsed ? "4.5rem" : "16rem",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Header — posicionamiento absoluto para evitar que el botón afecte el layout del logo */}
      <div
        className="relative flex items-center px-2 mb-5"
        style={{ height: "2.25rem" }}
      >
        {/* Logo: se desplaza de izquierda a centro con animación */}
        <button
          onClick={collapsed ? () => setCollapsed(false) : undefined}
          className="flex items-center gap-2 absolute"
          title={collapsed ? "Expandir menú" : undefined}
          style={{
            left: collapsed ? "50%" : "0.5rem",
            transform: collapsed ? "translateX(-50%)" : "none",
            transition:
              "left 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            cursor: collapsed ? "pointer" : "default",
          }}
        >
          <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-indigo-600 text-white font-bold text-sm select-none">
            U
          </div>
          <span
            className="font-semibold text-white text-base whitespace-nowrap"
            style={{
              opacity: collapsed ? 0 : 1,
              maxWidth: collapsed ? 0 : "8rem",
              overflow: "hidden",
              transition: "opacity 0.2s ease, max-width 0.3s ease",
            }}
          >
            Urbis
          </span>
        </button>

        {/* Botón colapsar — posición absoluta a la derecha, no afecta al logo */}
        <button
          onClick={() => setCollapsed(true)}
          className="absolute right-0 p-1.5 rounded-lg hover:bg-white/10"
          style={{
            color: TEXT,
            opacity: collapsed ? 0 : 1,
            pointerEvents: collapsed ? "none" : undefined,
            transition: "opacity 0.2s ease",
          }}
        >
          <PanelRightClose size={18} />
        </button>
      </div>

      {/* Notifications */}
      <ul className="space-y-0.5 mb-3">
        <NavItem
          icon={<Bell size={18} />}
          label="Notificaciones"
          badge="15"
          collapsed={collapsed}
        />
      </ul>

      <hr className="border-white/10 mb-3" />

      {/* Menú label */}
      <div
        className="overflow-hidden"
        style={{
          maxHeight: collapsed ? 0 : "2rem",
          opacity: collapsed ? 0 : 1,
          transition: "max-height 0.25s ease, opacity 0.2s ease",
        }}
      >
        <p
          className="text-xs px-3 mb-1.5 font-medium whitespace-nowrap"
          style={{ color: TEXT }}
        >
          Menú
        </p>
      </div>

      <ul className="space-y-0.5 flex-1">
        <NavItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          collapsed={collapsed}
          isActive={pathname.startsWith("/dashboard")}
          onClick={() => navigate(dashboardRoute)}
        />

        {isAdmin && (
          <NavItem
            icon={<Wrench size={18} />}
            label="Servicios"
            collapsed={collapsed}
            isActive={pathname === ROUTES.SERVICIOS}
            onClick={() => navigate(ROUTES.SERVICIOS)}
          />
        )}

        <NavItem
          icon={<FileBarChart2 size={18} />}
          label="Reportes"
          collapsed={collapsed}
          isActive={pathname === ROUTES.REPORTES}
          onClick={() => navigate(ROUTES.REPORTES)}
        />

        {(isAdmin || isCompany) && (
          <NavItem
            icon={<AlertTriangle size={18} />}
            label="Tipos Averías"
            collapsed={collapsed}
            isActive={pathname === ROUTES.TIPOS_AVERIAS}
            onClick={() => navigate(ROUTES.TIPOS_AVERIAS)}
          />
        )}

        {/* Empleados — visible para company sin submenu */}
        {isCompany && (
          <NavItem
            icon={<Briefcase size={18} />}
            label="Empleados"
            collapsed={collapsed}
            isActive={pathname === ROUTES.EMPLEADOS || (pathname === ROUTES.DETALLES_USUARIO && navState?.origen === ROUTES.EMPLEADOS)}
            onClick={() => navigate(ROUTES.EMPLEADOS)}
          />
        )}

        {/* Usuarios con submenu — solo admin */}
        {isAdmin && (
          <>
            <NavItem
              icon={<Users size={18} />}
              label="Usuarios"
              collapsed={collapsed}
              onClick={() => !collapsed && setUsuariosOpen((o) => !o)}
              rightElement={
                <ChevronRight
                  size={16}
                  style={{
                    color: TEXT,
                    transform: usuariosOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    flexShrink: 0,
                  }}
                />
              }
            />
            <div
              className="overflow-hidden"
              style={{
                maxHeight:
                  usuariosOpen && !collapsed ? submenuMaxHeight : "0px",
                opacity: usuariosOpen && !collapsed ? 1 : 0,
                transition:
                  "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
              }}
            >
              <ul className="space-y-0.5 pt-0.5">
                <NavItem
                  icon={<Building2 size={17} />}
                  label="Empresas"
                  indent
                  collapsed={collapsed}
                  isActive={pathname === ROUTES.EMPRESAS || (pathname === ROUTES.DETALLES_USUARIO && navState?.origen === ROUTES.EMPRESAS)}
                  onClick={() => navigate(ROUTES.EMPRESAS)}
                />
                <NavItem
                  icon={<Briefcase size={18} />}
                  label="Empleados"
                  indent
                  collapsed={collapsed}
                  isActive={pathname === ROUTES.EMPLEADOS || (pathname === ROUTES.DETALLES_USUARIO && navState?.origen === ROUTES.EMPLEADOS)}
                  onClick={() => navigate(ROUTES.EMPLEADOS)}
                />
                <NavItem
                  icon={<UserPlus size={17} />}
                  label="Reportantes"
                  indent
                  collapsed={collapsed}
                  isActive={pathname === ROUTES.REPORTANTES || (pathname === ROUTES.DETALLES_USUARIO && navState?.origen === ROUTES.REPORTANTES)}
                  onClick={() => navigate(ROUTES.REPORTANTES)}
                />
              </ul>
            </div>
          </>
        )}

        {!isCitizen && (
          <NavItem
            icon={<BarChart2 size={18} />}
            label="Metricas"
            collapsed={collapsed}
            isActive={
              pathname === ROUTES.METRICAS || pathname.startsWith("/metricas")
            }
            onClick={() => navigate(ROUTES.METRICAS)}
          />
        )}
      </ul>

      <hr className="border-white/10 my-3" />

      {/* Bottom */}
      <ul className="space-y-0.5">
        <NavItem
          icon={<UserCircle size={18} />}
          label="Mi cuenta"
          collapsed={collapsed}
          isActive={pathname === ROUTES.DETALLES_USUARIO && !navState?.origen}
          onClick={() => navigate(ROUTES.DETALLES_USUARIO)}
        />
        <NavItem
          icon={<LogOut size={18} />}
          label="Cerrar sesión"
          collapsed={collapsed}
          onClick={handleLogout}
          color="#F87171"
        />
      </ul>
    </div>
  );
}
