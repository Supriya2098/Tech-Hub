import type { Request, Response } from 'express';
import * as customersService from './customers.service';

export async function listHandler(req: Request, res: Response) {
  const { items, meta } = await customersService.listCustomers(req.user!.organizationId, req.query as any);
  res.status(200).json({ data: items, meta });
}

export async function getHandler(req: Request, res: Response) {
  const customer = await customersService.getCustomer(req.user!.organizationId, req.params.id);
  res.status(200).json({ data: customer });
}

export async function createHandler(req: Request, res: Response) {
  const customer = await customersService.createCustomer(req.user!.organizationId, req.body);
  res.status(201).json({ data: customer });
}

export async function updateHandler(req: Request, res: Response) {
  const customer = await customersService.updateCustomer(req.user!.organizationId, req.params.id, req.body);
  res.status(200).json({ data: customer });
}

export async function deleteHandler(req: Request, res: Response) {
  await customersService.deleteCustomer(req.user!.organizationId, req.params.id);
  res.status(204).send();
}
