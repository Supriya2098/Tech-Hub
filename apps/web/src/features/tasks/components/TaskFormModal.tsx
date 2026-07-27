import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useProjects } from '@/features/projects/hooks';
import { useEmployees } from '@/features/employees/hooks';
import type { Task } from '../api';

export interface TaskFormValues {
  projectId: string;
  employeeId: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialTask?: Task | null;
  defaultProjectId?: string;
}

function buildEmptyValues(defaultProjectId?: string): TaskFormValues {
  return {
    projectId: defaultProjectId ?? '',
    employeeId: '',
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
  };
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialTask,
  defaultProjectId,
}: TaskFormModalProps) {
  const [values, setValues] = useState<TaskFormValues>(buildEmptyValues(defaultProjectId));
  const [error, setError] = useState<string | null>(null);
  const { data: projectsData } = useProjects({ page: 1, limit: 100 });
  const { data: employeesData } = useEmployees({ page: 1, limit: 100 });

  useEffect(() => {
    if (isOpen) {
      setValues(
        initialTask
          ? {
              projectId: initialTask.projectId,
              employeeId: initialTask.employeeId ?? '',
              title: initialTask.title,
              description: initialTask.description ?? '',
              status: initialTask.status,
              priority: initialTask.priority,
              dueDate: initialTask.dueDate?.slice(0, 10) ?? '',
            }
          : buildEmptyValues(defaultProjectId),
      );
      setError(null);
    }
  }, [isOpen, initialTask, defaultProjectId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.projectId) {
      setError('Please select a project');
      return;
    }
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialTask ? 'Edit task' : 'New task'}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Title"
          required
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
        />
        <Textarea
          label="Description"
          rows={3}
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
        />
        <Select
          label="Project"
          required
          value={values.projectId}
          onChange={(e) => setValues((v) => ({ ...v, projectId: e.target.value }))}
        >
          <option value="">Select a project</option>
          {projectsData?.data.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select
          label="Assignee"
          value={values.employeeId}
          onChange={(e) => setValues((v) => ({ ...v, employeeId: e.target.value }))}
        >
          <option value="">Unassigned</option>
          {employeesData?.data.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            value={values.status}
            onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as TaskFormValues['status'] }))}
          >
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="IN_REVIEW">In review</option>
            <option value="DONE">Done</option>
          </Select>
          <Select
            label="Priority"
            value={values.priority}
            onChange={(e) => setValues((v) => ({ ...v, priority: e.target.value as TaskFormValues['priority'] }))}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </div>
        <Input
          label="Due date"
          type="date"
          value={values.dueDate}
          onChange={(e) => setValues((v) => ({ ...v, dueDate: e.target.value }))}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialTask ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
