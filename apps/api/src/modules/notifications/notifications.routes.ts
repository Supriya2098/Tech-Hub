import { Router } from 'express';
import { idParamSchema, notificationListQuerySchema } from '@techhub/shared-types';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', validate({ query: notificationListQuerySchema }), asyncHandler(controller.listHandler));
notificationsRouter.get('/unread-count', asyncHandler(controller.unreadCountHandler));
notificationsRouter.patch('/read-all', asyncHandler(controller.markAllReadHandler));
notificationsRouter.patch('/:id/read', validate({ params: idParamSchema }), asyncHandler(controller.markReadHandler));
