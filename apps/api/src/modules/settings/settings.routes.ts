import { Router } from 'express';
import { updateOrgSettingsSchema, updateProfileSchema } from '@techhub/shared-types';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import * as controller from './settings.controller';

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

settingsRouter.get('/organization', asyncHandler(controller.getOrgSettingsHandler));
settingsRouter.patch(
  '/organization',
  requireRole('ADMIN'),
  validate({ body: updateOrgSettingsSchema }),
  asyncHandler(controller.updateOrgSettingsHandler),
);
settingsRouter.patch('/profile', validate({ body: updateProfileSchema }), asyncHandler(controller.updateProfileHandler));
