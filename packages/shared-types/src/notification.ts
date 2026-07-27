import { z } from 'zod';

export const NotificationTypeEnum = z.enum(['INFO', 'SUCCESS', 'WARNING', 'ALERT']);
export type NotificationType = z.infer<typeof NotificationTypeEnum>;

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z.coerce.boolean().optional(),
});
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
