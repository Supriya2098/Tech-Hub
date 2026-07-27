import type { UpdateOrgSettingsInput, UpdateProfileInput } from '@techhub/shared-types';
import { api } from '@/lib/axios';

export interface OrgSettings {
  id: string;
  organizationId: string;
  organizationName: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  logoUrl: string | null;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

export async function getOrgSettings(): Promise<OrgSettings> {
  const { data } = await api.get('/settings/organization');
  return data.data;
}

export async function updateOrgSettings(input: UpdateOrgSettingsInput): Promise<OrgSettings> {
  const { data } = await api.patch('/settings/organization', input);
  return data.data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const { data } = await api.patch('/settings/profile', input);
  return data.data;
}
