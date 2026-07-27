import { z } from 'zod';

export const CustomerStatusEnum = z.enum(['LEAD', 'ACTIVE', 'INACTIVE', 'CHURNED']);
export type CustomerStatus = z.infer<typeof CustomerStatusEnum>;

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  email: z.string().trim().email('Invalid email').max(200).optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  status: CustomerStatusEnum.optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const customerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: CustomerStatusEnum.optional(),
});
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;
