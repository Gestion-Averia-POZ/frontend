import { api } from './api';

export type NotificationType =
  | 'ASSIGNMENT'
  | 'PENDING_REPORTS'
  | 'STATUS_CHANGE'
  | 'REPORT_CANCELLED';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export const notificationsService = {
  getUnread: (userId: string): Promise<Notification[]> =>
    api
      .get<{ success: boolean; data: { notifications: Notification[] } }>(
        `/api/notifications/user/${userId}/unread`
      )
      .then((res) => res.data.notifications),

  markAsRead: (id: string): Promise<Notification> =>
    api
      .patch<{ success: boolean; data: { notification: Notification } }>(
        `/api/notifications/${id}/read`,
        {}
      )
      .then((res) => res.data.notification),

  markAllAsRead: (userId: string): Promise<void> =>
    api
      .patch<{ success: boolean }>(
        `/api/notifications/user/${userId}/read-all`,
        {}
      )
      .then(() => undefined),
};
