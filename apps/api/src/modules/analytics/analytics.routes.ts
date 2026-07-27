import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './analytics.controller';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);
analyticsRouter.get('/overview', asyncHandler(controller.overviewHandler));
