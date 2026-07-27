import { z } from 'zod';

export const InvoiceStatusEnum = z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'VOID']);
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

export const createInvoiceSchema = z.object({
  customerId: z.string().trim().min(1, 'customerId is required'),
  invoiceNumber: z.string().trim().min(1, 'invoiceNumber is required').max(60),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  status: InvoiceStatusEnum.optional(),
  dueAt: z.coerce.date().optional(),
});
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const updateInvoiceSchema = createInvoiceSchema.partial();
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

export const createPaymentSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  method: z.string().trim().max(40).optional(),
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const invoiceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: InvoiceStatusEnum.optional(),
  customerId: z.string().trim().optional(),
});
export type InvoiceListQuery = z.infer<typeof invoiceListQuerySchema>;
