import type { Request, Response } from 'express';
import * as documentsService from './documents.service';

export async function listHandler(req: Request, res: Response) {
  const { items, meta } = await documentsService.listDocuments(req.user!.organizationId, req.query as any);
  res.status(200).json({ data: items, meta });
}

export async function getHandler(req: Request, res: Response) {
  const document = await documentsService.getDocument(req.user!.organizationId, req.params.id);
  res.status(200).json({ data: document });
}

export async function createHandler(req: Request, res: Response) {
  const document = await documentsService.createDocument(req.user!.organizationId, req.body);
  res.status(201).json({ data: document });
}

export async function updateHandler(req: Request, res: Response) {
  const document = await documentsService.updateDocument(req.user!.organizationId, req.params.id, req.body);
  res.status(200).json({ data: document });
}

export async function deleteHandler(req: Request, res: Response) {
  await documentsService.deleteDocument(req.user!.organizationId, req.params.id);
  res.status(204).send();
}
