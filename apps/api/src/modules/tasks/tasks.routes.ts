import { Router } from 'express';
import { createTaskSchema, idParamSchema, taskListQuerySchema, updateTaskSchema } from '@techhub/shared-types';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import * as controller from './tasks.controller';

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.get('/', validate({ query: taskListQuerySchema }), asyncHandler(controller.listHandler));
tasksRouter.get('/:id', validate({ params: idParamSchema }), asyncHandler(controller.getHandler));
tasksRouter.post('/', validate({ body: createTaskSchema }), asyncHandler(controller.createHandler));
tasksRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateTaskSchema }),
  asyncHandler(controller.updateHandler),
);
tasksRouter.delete(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteHandler),
);
