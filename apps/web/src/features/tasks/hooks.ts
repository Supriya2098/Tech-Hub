import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTaskInput, TaskListQuery, UpdateTaskInput } from '@techhub/shared-types';
import * as tasksApi from './api';

const TASKS_KEY = 'tasks';

export function useTasks(query: TaskListQuery) {
  return useQuery({
    queryKey: [TASKS_KEY, query],
    queryFn: () => tasksApi.listTasks(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.createTask(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => tasksApi.updateTask(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}
