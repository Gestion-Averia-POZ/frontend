import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NOTIFICATIONS = 15;

export default function UserHeader() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    user.role === "admin"
      ? "Admin"
      : user.role === "empresa"
        ? "Empresa"
        : "Ciudadano";

  return (
    <div className="flex items-center gap-3">
      {/* Campana con badge */}
      <div className="relative">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
          <Bell size={15} className="text-gray-600" />
          <span className="text-xs font-semibold text-gray-700">
            +{NOTIFICATIONS}
          </span>
        </div>
      </div>

      {/* Avatar + nombre + rol */}
      <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-full pl-1 pr-3 py-1 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
            {user.name}
          </p>
          <p className="text-xs text-gray-400">{roleLabel}</p>
        </div>
      </div>
    </div>
  );
}
