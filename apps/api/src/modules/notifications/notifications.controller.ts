import type { Request, Response } from 'express';
import * as notificationsService from './notifications.service';

export async function listHandler(req: Request, res: Response) {
  const { items, meta } = await notificationsService.listNotifications(req.user!.organizationId, req.query as any);
  res.status(200).json({ data: items, meta });
}

export async function unreadCountHandler(req: Request, res: Response) {
  const count = await notificationsService.unreadCount(req.user!.organizationId);
  res.status(200).json({ data: { count } });
}

export async function markReadHandler(req: Request, res: Response) {
  const notification = await notificationsService.markAsRead(req.user!.organizationId, req.params.id);
  res.status(200).json({ data: notification });
}

export async function markAllReadHandler(req: Request, res: Response) {
  await notificationsService.markAllAsRead(req.user!.organizationId);
  res.status(204).send();
}
