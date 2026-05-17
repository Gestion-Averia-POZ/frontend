import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../services/api';
import {
  notificationsService,
  type Notification,
} from '../services/notifications.service';
import { API_URL } from '../config';
import notificationSound from '../assets/sound/notification_sound.mp3';
import { queryKeys } from './useQueryHooks';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  toggleOpen: () => void;
  closePanel: () => void;
  handleMarkAsRead: (id: string) => Promise<void>;
  handleMarkAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!user) return;

    notificationsService
      .getUnread(user.id)
      .then(setNotifications)
      .catch(console.error);

    const socket = io(API_URL, {
      query: { token: getToken() },
    });
    socketRef.current = socket;

    socket.on('new_notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      try {
        new Audio(notificationSound).play().catch(() => {});
      } catch {
        // autoplay bloqueado por el navegador
      }

      switch (notification.type) {
        case 'ASSIGNMENT':
          queryClient.invalidateQueries({ queryKey: queryKeys.reports.assigned() });
          break;
        case 'STATUS_CHANGE':
        case 'REPORT_CANCELLED':
          queryClient.invalidateQueries({ queryKey: ['reports'] });
          break;
        case 'PENDING_REPORTS':
          queryClient.invalidateQueries({ queryKey: queryKeys.reports.all() });
          break;
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);
  const closePanel = useCallback(() => setIsOpen(false), []);

  const handleMarkAsRead = useCallback(async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!user) return;
    await notificationsService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, [user]);

  return {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    closePanel,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
}
