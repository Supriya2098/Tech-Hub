import type { Request, Response } from 'express';
import * as authService from './auth.service';

export async function registerHandler(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json({ data: result });
}

export async function loginHandler(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.status(200).json({ data: result });
}

export async function refreshHandler(req: Request, res: Response) {
  const result = await authService.refresh(req.body.refreshToken);
  res.status(200).json({ data: result });
}

export async function logoutHandler(req: Request, res: Response) {
  await authService.logout(req.body.refreshToken);
  res.status(204).send();
}

export async function meHandler(req: Request, res: Response) {
  const result = await authService.getMe(req.user!.sub);
  res.status(200).json({ data: result });
}
