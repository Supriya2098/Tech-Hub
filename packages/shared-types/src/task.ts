import { z } from 'zod';

export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;

export const createTaskSchema = z.object({
  projectId: z.string().trim().min(1, 'projectId is required'),
  employeeId: z.string().trim().min(1).optional().or(z.literal('')),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(4000).optional().or(z.literal('')),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  dueDate: z.coerce.date().optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial().omit({ projectId: true }).extend({
  projectId: z.string().trim().min(1).optional(),
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  projectId: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
});
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
