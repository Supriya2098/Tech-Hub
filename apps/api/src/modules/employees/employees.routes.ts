import { Router } from 'express';
import { createEmployeeSchema, employeeListQuerySchema, idParamSchema, updateEmployeeSchema } from '@techhub/shared-types';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import * as controller from './employees.controller';

export const employeesRouter = Router();

employeesRouter.use(requireAuth);

employeesRouter.get('/', validate({ query: employeeListQuerySchema }), asyncHandler(controller.listHandler));
employeesRouter.get('/:id', validate({ params: idParamSchema }), asyncHandler(controller.getHandler));
employeesRouter.post(
  '/',
  requireRole('ADMIN', 'MANAGER'),
  validate({ body: createEmployeeSchema }),
  asyncHandler(controller.createHandler),
);
employeesRouter.patch(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validate({ params: idParamSchema, body: updateEmployeeSchema }),
  asyncHandler(controller.updateHandler),
);
employeesRouter.delete(
  '/:id',
  requireRole('ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteHandler),
);
