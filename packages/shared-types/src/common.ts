import { z } from 'zod';

export const RoleEnum = z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']);
export type Role = z.infer<typeof RoleEnum>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorBody {
  error: {
    message: string;
    code: string;
    fieldErrors?: Record<string, string[] | undefined>;
  };
}

export const idParamSchema = z.object({
  id: z.string().min(1, 'id is required'),
});
