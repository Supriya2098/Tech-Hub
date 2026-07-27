import { z } from 'zod';

export const createDocumentSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  url: z.string().trim().url('Must be a valid URL'),
  mimeType: z.string().trim().max(120).optional().or(z.literal('')),
  sizeBytes: z.coerce.number().int().nonnegative().optional(),
  tags: z.array(z.string().trim().max(40)).max(20).optional(),
});
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = createDocumentSchema.partial();
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

export const documentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  tag: z.string().trim().max(40).optional(),
});
export type DocumentListQuery = z.infer<typeof documentListQuerySchema>;
