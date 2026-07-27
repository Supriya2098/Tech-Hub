import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from '@techhub/shared-types';
import { api } from '@/lib/axios';

export async function loginRequest(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', input);
  return data.data;
}

export async function registerRequest(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await api.post('/auth/register', input);
  return data.data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}

export async function meRequest(): Promise<AuthUser> {
  const { data } = await api.get('/auth/me');
  return data.data;
}
