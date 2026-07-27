import { z } from 'zod';

export const ProjectStatusEnum = z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']);
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  description: z.string().trim().max(4000).optional().or(z.literal('')),
  customerId: z.string().trim().min(1).optional().or(z.literal('')),
  status: ProjectStatusEnum.optional(),
  budget: z.coerce.number().nonnegative().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: ProjectStatusEnum.optional(),
  customerId: z.string().trim().optional(),
});
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
