import type { ApiSuccess, NotificationListQuery } from '@techhub/shared-types';
import { api } from '@/lib/axios';

export interface Notification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function listNotifications(query: NotificationListQuery): Promise<ApiSuccess<Notification[]>> {
  const { data } = await api.get('/notifications', { params: query });
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get('/notifications/unread-count');
  return data.data.count;
}

export async function markAsRead(id: string): Promise<Notification> {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data;
}

export async function markAllAsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}
