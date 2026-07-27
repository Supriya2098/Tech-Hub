import type { Request, Response } from 'express';
import * as analyticsService from './analytics.service';

export async function overviewHandler(req: Request, res: Response) {
  const overview = await analyticsService.getAnalyticsOverview(req.user!.organizationId);
  res.status(200).json({ data: overview });
}
