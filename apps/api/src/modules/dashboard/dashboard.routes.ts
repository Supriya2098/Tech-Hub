import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get('/summary', asyncHandler(controller.summaryHandler));
