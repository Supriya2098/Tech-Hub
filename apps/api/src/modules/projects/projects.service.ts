import type { Prisma } from '@prisma/client';
import type { CreateProjectInput, ProjectListQuery, UpdateProjectInput } from '@techhub/shared-types';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { buildPaginationMeta, toSkipTake } from '../../lib/pagination';

export async function listProjects(organizationId: string, query: ProjectListQuery) {
  const where: Prisma.ProjectWhereInput = {
    organizationId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { id: true, name: true } }, _count: { select: { tasks: true } } },
      ...toSkipTake(query.page, query.limit),
    }),
    prisma.project.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function getProject(organizationId: string, id: string) {
  const project = await prisma.project.findFirst({
    where: { id, organizationId },
    include: { customer: { select: { id: true, name: true } }, _count: { select: { tasks: true } } },
  });
  if (!project) throw AppError.notFound('Project not found');
  return project;
}

async function assertCustomerBelongsToOrg(organizationId: string, customerId?: string | null) {
  if (!customerId) return;
  const customer = await prisma.customer.findFirst({ where: { id: customerId, organizationId } });
  if (!customer) throw AppError.badRequest('customerId does not reference a valid customer');
}

export async function createProject(organizationId: string, input: CreateProjectInput) {
  await assertCustomerBelongsToOrg(organizationId, input.customerId);
  return prisma.project.create({
    data: {
      organizationId,
      name: input.name,
      description: input.description || null,
      customerId: input.customerId || null,
      status: input.status,
      budget: input.budget,
      startDate: input.startDate,
      endDate: input.endDate,
    },
  });
}

export async function updateProject(organizationId: string, id: string, input: UpdateProjectInput) {
  await getProject(organizationId, id);
  if (input.customerId !== undefined) {
    await assertCustomerBelongsToOrg(organizationId, input.customerId || null);
  }

  return prisma.project.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      ...(input.customerId !== undefined ? { customerId: input.customerId || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.budget !== undefined ? { budget: input.budget } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
      ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
    },
  });
}

export async function deleteProject(organizationId: string, id: string) {
  await getProject(organizationId, id);
  await prisma.project.delete({ where: { id } });
}
