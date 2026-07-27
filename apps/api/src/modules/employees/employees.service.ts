import type { Prisma } from '@prisma/client';
import type { CreateEmployeeInput, EmployeeListQuery, UpdateEmployeeInput } from '@techhub/shared-types';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { buildPaginationMeta, toSkipTake } from '../../lib/pagination';

export async function listEmployees(organizationId: string, query: EmployeeListQuery) {
  const where: Prisma.EmployeeWhereInput = {
    organizationId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.department ? { department: query.department } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { title: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.employee.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query.page, query.limit) }),
    prisma.employee.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function getEmployee(organizationId: string, id: string) {
  const employee = await prisma.employee.findFirst({ where: { id, organizationId } });
  if (!employee) throw AppError.notFound('Employee not found');
  return employee;
}

export async function createEmployee(organizationId: string, input: CreateEmployeeInput) {
  return prisma.employee.create({
    data: {
      organizationId,
      name: input.name,
      email: input.email,
      department: input.department || null,
      title: input.title || null,
      status: input.status,
      salary: input.salary,
      hiredAt: input.hiredAt,
    },
  });
}

export async function updateEmployee(organizationId: string, id: string, input: UpdateEmployeeInput) {
  await getEmployee(organizationId, id);
  return prisma.employee.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.department !== undefined ? { department: input.department || null } : {}),
      ...(input.title !== undefined ? { title: input.title || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.salary !== undefined ? { salary: input.salary } : {}),
      ...(input.hiredAt !== undefined ? { hiredAt: input.hiredAt } : {}),
    },
  });
}

export async function deleteEmployee(organizationId: string, id: string) {
  await getEmployee(organizationId, id);
  await prisma.employee.delete({ where: { id } });
}
