import type { Request, Response } from 'express';
import * as projectsService from './projects.service';

export async function listHandler(req: Request, res: Response) {
  const { items, meta } = await projectsService.listProjects(req.user!.organizationId, req.query as any);
  res.status(200).json({ data: items, meta });
}

export async function getHandler(req: Request, res: Response) {
  const project = await projectsService.getProject(req.user!.organizationId, req.params.id);
  res.status(200).json({ data: project });
}

export async function createHandler(req: Request, res: Response) {
  const project = await projectsService.createProject(req.user!.organizationId, req.body);
  res.status(201).json({ data: project });
}

export async function updateHandler(req: Request, res: Response) {
  const project = await projectsService.updateProject(req.user!.organizationId, req.params.id, req.body);
  res.status(200).json({ data: project });
}

export async function deleteHandler(req: Request, res: Response) {
  await projectsService.deleteProject(req.user!.organizationId, req.params.id);
  res.status(204).send();
}
