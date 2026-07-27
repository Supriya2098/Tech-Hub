import { Router } from 'express';
import { createCustomerSchema, customerListQuerySchema, idParamSchema, updateCustomerSchema } from '@techhub/shared-types';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import * as controller from './customers.controller';

export const customersRouter = Router();

customersRouter.use(requireAuth);

customersRouter.get('/', validate({ query: customerListQuerySchema }), asyncHandler(controller.listHandler));
customersRouter.get('/:id', validate({ params: idParamSchema }), asyncHandler(controller.getHandler));
customersRouter.post('/', validate({ body: createCustomerSchema }), asyncHandler(controller.createHandler));
customersRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateCustomerSchema }),
  asyncHandler(controller.updateHandler),
);
customersRouter.delete(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteHandler),
);
