import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './ai-insights.controller';

export const aiInsightsRouter = Router();

aiInsightsRouter.use(requireAuth);
aiInsightsRouter.get('/', asyncHandler(controller.listHandler));
