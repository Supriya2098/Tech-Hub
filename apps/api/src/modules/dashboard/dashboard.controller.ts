import type { Request, Response } from 'express';
import * as dashboardService from './dashboard.service';

export async function summaryHandler(req: Request, res: Response) {
  const summary = await dashboardService.getDashboardSummary(req.user!.organizationId);
  res.status(200).json({ data: summary });
}
