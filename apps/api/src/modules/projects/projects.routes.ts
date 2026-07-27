import { Router } from 'express';
import { createProjectSchema, idParamSchema, projectListQuerySchema, updateProjectSchema } from '@techhub/shared-types';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import * as controller from './projects.controller';

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.get('/', validate({ query: projectListQuerySchema }), asyncHandler(controller.listHandler));
projectsRouter.get('/:id', validate({ params: idParamSchema }), asyncHandler(controller.getHandler));
projectsRouter.post('/', validate({ body: createProjectSchema }), asyncHandler(controller.createHandler));
projectsRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateProjectSchema }),
  asyncHandler(controller.updateHandler),
);
projectsRouter.delete(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteHandler),
);
