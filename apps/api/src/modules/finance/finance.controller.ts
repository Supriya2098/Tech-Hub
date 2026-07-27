import type { Request, Response } from 'express';
import * as financeService from './finance.service';

export async function listHandler(req: Request, res: Response) {
  const { items, meta } = await financeService.listInvoices(req.user!.organizationId, req.query as any);
  res.status(200).json({ data: items, meta });
}

export async function getHandler(req: Request, res: Response) {
  const invoice = await financeService.getInvoice(req.user!.organizationId, req.params.id);
  res.status(200).json({ data: invoice });
}

export async function createHandler(req: Request, res: Response) {
  const invoice = await financeService.createInvoice(req.user!.organizationId, req.body);
  res.status(201).json({ data: invoice });
}

export async function updateHandler(req: Request, res: Response) {
  const invoice = await financeService.updateInvoice(req.user!.organizationId, req.params.id, req.body);
  res.status(200).json({ data: invoice });
}

export async function deleteHandler(req: Request, res: Response) {
  await financeService.deleteInvoice(req.user!.organizationId, req.params.id);
  res.status(204).send();
}

export async function recordPaymentHandler(req: Request, res: Response) {
  const payment = await financeService.recordPayment(req.user!.organizationId, req.params.id, req.body);
  res.status(201).json({ data: payment });
}
