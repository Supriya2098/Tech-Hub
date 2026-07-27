import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationListQuery } from '@techhub/shared-types';
import * as notificationsApi from './api';

const NOTIFICATIONS_KEY = 'notifications';

export function useNotifications(query: NotificationListQuery) {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, query],
    queryFn: () => notificationsApi.listNotifications(query),
    placeholderData: (prev) => prev,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 60_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] }),
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] }),
  });
}
