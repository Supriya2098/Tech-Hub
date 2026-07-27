import type { Request, Response } from 'express';
import * as aiInsightsService from './ai-insights.service';

export async function listHandler(req: Request, res: Response) {
  const insights = await aiInsightsService.generateInsights(req.user!.organizationId);
  res.status(200).json({ data: insights });
}
