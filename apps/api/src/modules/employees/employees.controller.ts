import type { Request, Response } from 'express';
import * as employeesService from './employees.service';

export async function listHandler(req: Request, res: Response) {
  const { items, meta } = await employeesService.listEmployees(req.user!.organizationId, req.query as any);
  res.status(200).json({ data: items, meta });
}

export async function getHandler(req: Request, res: Response) {
  const employee = await employeesService.getEmployee(req.user!.organizationId, req.params.id);
  res.status(200).json({ data: employee });
}

export async function createHandler(req: Request, res: Response) {
  const employee = await employeesService.createEmployee(req.user!.organizationId, req.body);
  res.status(201).json({ data: employee });
}

export async function updateHandler(req: Request, res: Response) {
  const employee = await employeesService.updateEmployee(req.user!.organizationId, req.params.id, req.body);
  res.status(200).json({ data: employee });
}

export async function deleteHandler(req: Request, res: Response) {
  await employeesService.deleteEmployee(req.user!.organizationId, req.params.id);
  res.status(204).send();
}
