import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationDropdown from "../notifications/NotificationDropdown";

export default function UserHeader() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    closePanel,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotifications();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {/* Campana con badge y dropdown */}
      <div className="relative">
        <button
          onClick={toggleOpen}
          className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Bell size={15} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="text-xs font-semibold text-gray-700">
              +{unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <NotificationDropdown
            notifications={notifications}
            onClose={closePanel}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        )}
      </div>

      {/* Avatar + nombre */}
      <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-full pl-1 pr-3 py-1 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
            {user.name}
          </p>
        </div>
      </div>
    </div>
  );
}
