import { z } from 'zod';

export const EmployeeStatusEnum = z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED']);
export type EmployeeStatus = z.infer<typeof EmployeeStatusEnum>;

export const createEmployeeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  email: z.string().trim().email('Invalid email').max(200),
  department: z.string().trim().max(120).optional().or(z.literal('')),
  title: z.string().trim().max(120).optional().or(z.literal('')),
  status: EmployeeStatusEnum.optional(),
  salary: z.coerce.number().nonnegative().optional(),
  hiredAt: z.coerce.date().optional(),
});
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = createEmployeeSchema.partial();
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const employeeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: EmployeeStatusEnum.optional(),
  department: z.string().trim().max(120).optional(),
});
export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
