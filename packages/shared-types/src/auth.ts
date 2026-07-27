import { z } from 'zod';
import { RoleEnum } from './common';

export const registerSchema = z.object({
  organizationName: z.string().trim().min(2, 'Organization name is required').max(120),
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: z.string().trim().email('Invalid email address').max(200),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export interface AuthUser {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  email: string;
  role: z.infer<typeof RoleEnum>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
