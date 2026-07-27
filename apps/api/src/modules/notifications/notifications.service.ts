import type { Prisma } from '@prisma/client';
import type { NotificationListQuery, NotificationType } from '@techhub/shared-types';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { buildPaginationMeta, toSkipTake } from '../../lib/pagination';

interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  userId?: string | null;
}

/** Internal helper used by other modules to raise system notifications (e.g. task completed, invoice overdue). */
export async function createNotification(organizationId: string, input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      organizationId,
      userId: input.userId ?? null,
      type: input.type,
      title: input.title,
      message: input.message,
    },
  });
}

export async function listNotifications(organizationId: string, query: NotificationListQuery) {
  const where: Prisma.NotificationWhereInput = {
    organizationId,
    ...(query.isRead !== undefined ? { isRead: query.isRead } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query.page, query.limit) }),
    prisma.notification.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function markAsRead(organizationId: string, id: string) {
  const notification = await prisma.notification.findFirst({ where: { id, organizationId } });
  if (!notification) throw AppError.notFound('Notification not found');
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllAsRead(organizationId: string) {
  await prisma.notification.updateMany({ where: { organizationId, isRead: false }, data: { isRead: true } });
}

export async function unreadCount(organizationId: string) {
  return prisma.notification.count({ where: { organizationId, isRead: false } });
}
