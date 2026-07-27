import { z } from 'zod';

export const updateOrgSettingsSchema = z.object({
  timezone: z.string().trim().min(1).max(80).optional(),
  currency: z.string().trim().length(3, 'Currency must be a 3-letter ISO code').optional(),
  dateFormat: z.string().trim().min(1).max(40).optional(),
  logoUrl: z.string().trim().url('Must be a valid URL').optional().or(z.literal('')),
  organizationName: z.string().trim().min(2).max(120).optional(),
});
export type UpdateOrgSettingsInput = z.infer<typeof updateOrgSettingsSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
