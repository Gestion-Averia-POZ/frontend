import { useRef, useEffect, type ReactNode } from 'react';
import {
  UserCheck,
  RefreshCw,
  XCircle,
  AlertTriangle,
  CheckCheck,
} from 'lucide-react';
import type {
  Notification,
  NotificationType,
} from '../../services/notifications.service';

interface Props {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

const ICON_MAP: Record<NotificationType, ReactNode> = {
  ASSIGNMENT: <UserCheck size={18} className="text-indigo-500" />,
  STATUS_CHANGE: <RefreshCw size={18} className="text-blue-500" />,
  REPORT_CANCELLED: <XCircle size={18} className="text-red-500" />,
  PENDING_REPORTS: <AlertTriangle size={18} className="text-yellow-500" />,
};

function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'ahora mismo';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} hora${h !== 1 ? 's' : ''}`;
  const d = Math.floor(h / 24);
  return `hace ${d} día${d !== 1 ? 's' : ''}`;
}

export default function NotificationDropdown({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-semibold text-gray-800 text-sm">
          Notificaciones
        </span>
        <button
          onClick={onMarkAllAsRead}
          title="Marcar todas como leídas"
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <CheckCheck size={14} />
          <span>Leer todas</span>
        </button>
      </div>

      {/* Lista */}
      <ul className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-gray-400">
            Sin notificaciones nuevas
          </li>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              onClick={() => !n.isRead && onMarkAsRead(n.id)}
              className={`flex gap-3 px-4 py-3 transition-colors ${
                n.isRead
                  ? 'cursor-default'
                  : 'cursor-pointer hover:bg-gray-50 bg-blue-50/40'
              }`}
            >
              {/* Ícono según tipo */}
              <div className="shrink-0 mt-0.5">
                {ICON_MAP[n.type] ?? <AlertTriangle size={18} className="text-gray-400" />}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-tight truncate">
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                  {n.description}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-400">
                    {timeAgo(n.createdAt)}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
