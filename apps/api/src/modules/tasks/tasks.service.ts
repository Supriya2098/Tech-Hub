import type { Prisma } from '@prisma/client';
import type { CreateTaskInput, TaskListQuery, UpdateTaskInput } from '@techhub/shared-types';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { buildPaginationMeta, toSkipTake } from '../../lib/pagination';
import { createNotification } from '../notifications/notifications.service';

export async function listTasks(organizationId: string, query: TaskListQuery) {
  const where: Prisma.TaskWhereInput = {
    organizationId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.projectId ? { projectId: query.projectId } : {}),
    ...(query.employeeId ? { employeeId: query.employeeId } : {}),
    ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        project: { select: { id: true, name: true } },
        employee: { select: { id: true, name: true } },
      },
      ...toSkipTake(query.page, query.limit),
    }),
    prisma.task.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function getTask(organizationId: string, id: string) {
  const task = await prisma.task.findFirst({
    where: { id, organizationId },
    include: { project: { select: { id: true, name: true } }, employee: { select: { id: true, name: true } } },
  });
  if (!task) throw AppError.notFound('Task not found');
  return task;
}

async function assertProjectBelongsToOrg(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } });
  if (!project) throw AppError.badRequest('projectId does not reference a valid project');
}

async function assertEmployeeBelongsToOrg(organizationId: string, employeeId?: string | null) {
  if (!employeeId) return;
  const employee = await prisma.employee.findFirst({ where: { id: employeeId, organizationId } });
  if (!employee) throw AppError.badRequest('employeeId does not reference a valid employee');
}

export async function createTask(organizationId: string, input: CreateTaskInput) {
  await assertProjectBelongsToOrg(organizationId, input.projectId);
  await assertEmployeeBelongsToOrg(organizationId, input.employeeId);

  return prisma.task.create({
    data: {
      organizationId,
      projectId: input.projectId,
      employeeId: input.employeeId || null,
      title: input.title,
      description: input.description || null,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
    },
  });
}

export async function updateTask(organizationId: string, id: string, input: UpdateTaskInput) {
  const existing = await getTask(organizationId, id);

  if (input.projectId !== undefined) {
    await assertProjectBelongsToOrg(organizationId, input.projectId);
  }
  if (input.employeeId !== undefined) {
    await assertEmployeeBelongsToOrg(organizationId, input.employeeId || null);
  }

  const justCompleted = input.status === 'DONE' && existing.status !== 'DONE';

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
      ...(input.employeeId !== undefined ? { employeeId: input.employeeId || null } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(justCompleted ? { completedAt: new Date() } : {}),
    },
  });

  if (justCompleted) {
    await createNotification(organizationId, {
      type: 'SUCCESS',
      title: 'Task completed',
      message: `"${updated.title}" was marked as done.`,
    });
  }

  return updated;
}

export async function deleteTask(organizationId: string, id: string) {
  await getTask(organizationId, id);
  await prisma.task.delete({ where: { id } });
}
