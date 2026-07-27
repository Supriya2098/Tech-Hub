import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateProjectInput, ProjectListQuery, UpdateProjectInput } from '@techhub/shared-types';
import * as projectsApi from './api';

const PROJECTS_KEY = 'projects';

export function useProjects(query: ProjectListQuery) {
  return useQuery({
    queryKey: [PROJECTS_KEY, query],
    queryFn: () => projectsApi.listProjects(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.createProject(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) => projectsApi.updateProject(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  });
}
