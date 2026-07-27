import { Router } from 'express';
import {
  createInvoiceSchema,
  createPaymentSchema,
  idParamSchema,
  invoiceListQuerySchema,
  updateInvoiceSchema,
} from '@techhub/shared-types';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import * as controller from './finance.controller';

export const financeRouter = Router();

financeRouter.use(requireAuth);

financeRouter.get('/invoices', validate({ query: invoiceListQuerySchema }), asyncHandler(controller.listHandler));
financeRouter.get('/invoices/:id', validate({ params: idParamSchema }), asyncHandler(controller.getHandler));
financeRouter.post(
  '/invoices',
  requireRole('ADMIN', 'MANAGER'),
  validate({ body: createInvoiceSchema }),
  asyncHandler(controller.createHandler),
);
financeRouter.patch(
  '/invoices/:id',
  requireRole('ADMIN', 'MANAGER'),
  validate({ params: idParamSchema, body: updateInvoiceSchema }),
  asyncHandler(controller.updateHandler),
);
financeRouter.delete(
  '/invoices/:id',
  requireRole('ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteHandler),
);
financeRouter.post(
  '/invoices/:id/payments',
  requireRole('ADMIN', 'MANAGER'),
  validate({ params: idParamSchema, body: createPaymentSchema }),
  asyncHandler(controller.recordPaymentHandler),
);
