import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateOrgSettingsInput, UpdateProfileInput } from '@techhub/shared-types';
import * as settingsApi from './api';

export function useOrgSettings() {
  return useQuery({ queryKey: ['settings', 'organization'], queryFn: settingsApi.getOrgSettings });
}

export function useUpdateOrgSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrgSettingsInput) => settingsApi.updateOrgSettings(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'organization'] }),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => settingsApi.updateProfile(input),
  });
}
