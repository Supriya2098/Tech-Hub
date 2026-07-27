import { Router } from 'express';
import { createDocumentSchema, documentListQuerySchema, idParamSchema, updateDocumentSchema } from '@techhub/shared-types';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './documents.controller';

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

documentsRouter.get('/', validate({ query: documentListQuerySchema }), asyncHandler(controller.listHandler));
documentsRouter.get('/:id', validate({ params: idParamSchema }), asyncHandler(controller.getHandler));
documentsRouter.post('/', validate({ body: createDocumentSchema }), asyncHandler(controller.createHandler));
documentsRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateDocumentSchema }),
  asyncHandler(controller.updateHandler),
);
documentsRouter.delete('/:id', validate({ params: idParamSchema }), asyncHandler(controller.deleteHandler));
