import type { Request, Response } from 'express';
import * as settingsService from './settings.service';

export async function getOrgSettingsHandler(req: Request, res: Response) {
  const settings = await settingsService.getOrgSettings(req.user!.organizationId);
  res.status(200).json({ data: settings });
}

export async function updateOrgSettingsHandler(req: Request, res: Response) {
  const settings = await settingsService.updateOrgSettings(req.user!.organizationId, req.body);
  res.status(200).json({ data: settings });
}

export async function updateProfileHandler(req: Request, res: Response) {
  const profile = await settingsService.updateProfile(req.user!.sub, req.body);
  res.status(200).json({ data: profile });
}
