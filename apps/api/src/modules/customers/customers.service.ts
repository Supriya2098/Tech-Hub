import type { Prisma } from '@prisma/client';
import type { CreateCustomerInput, CustomerListQuery, UpdateCustomerInput } from '@techhub/shared-types';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { buildPaginationMeta, toSkipTake } from '../../lib/pagination';

export async function listCustomers(organizationId: string, query: CustomerListQuery) {
  const where: Prisma.CustomerWhereInput = {
    organizationId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { company: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query.page, query.limit) }),
    prisma.customer.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function getCustomer(organizationId: string, id: string) {
  const customer = await prisma.customer.findFirst({ where: { id, organizationId } });
  if (!customer) throw AppError.notFound('Customer not found');
  return customer;
}

export async function createCustomer(organizationId: string, input: CreateCustomerInput) {
  return prisma.customer.create({
    data: {
      organizationId,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      company: input.company || null,
      status: input.status,
      notes: input.notes || null,
    },
  });
}

export async function updateCustomer(organizationId: string, id: string, input: UpdateCustomerInput) {
  await getCustomer(organizationId, id);
  return prisma.customer.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email || null } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
      ...(input.company !== undefined ? { company: input.company || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
    },
  });
}

export async function deleteCustomer(organizationId: string, id: string) {
  await getCustomer(organizationId, id);
  await prisma.customer.delete({ where: { id } });
}
