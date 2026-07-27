import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { extractErrorMessage } from '@/lib/axios';
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '../hooks';
import { TaskFormModal, type TaskFormValues } from '../components/TaskFormModal';
import type { Task } from '../api';

const statusTone: Record<Task['status'], 'slate' | 'green' | 'yellow' | 'blue'> = {
  TODO: 'slate',
  IN_PROGRESS: 'blue',
  IN_REVIEW: 'yellow',
  DONE: 'green',
};

const priorityTone: Record<Task['priority'], 'slate' | 'blue' | 'yellow' | 'red'> = {
  LOW: 'slate',
  MEDIUM: 'blue',
  HIGH: 'yellow',
  URGENT: 'red',
};

export function TasksPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const { showToast } = useToast();
  const { data, isLoading, isError, refetch } = useTasks({
    page,
    limit: 10,
    search: search || undefined,
    status: (status || undefined) as Task['status'] | undefined,
    priority: (priority || undefined) as Task['priority'] | undefined,
  });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  async function handleSubmit(values: TaskFormValues) {
    const input = {
      ...values,
      employeeId: values.employeeId || undefined,
      dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
    };
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, input });
      showToast('Task updated', 'success');
    } else {
      await createTask.mutateAsync(input);
      showToast('Task created', 'success');
    }
  }

  async function handleDelete() {
    if (!deletingTask) return;
    try {
      await deleteTask.mutateAsync(deletingTask.id);
      showToast('Task deleted', 'success');
      setDeletingTask(null);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  }

  const columns: Column<Task>[] = [
    { header: 'Title', render: (t) => <span className="font-medium text-slate-900 dark:text-slate-100">{t.title}</span> },
    { header: 'Project', render: (t) => t.project.name },
    { header: 'Assignee', render: (t) => t.employee?.name || 'Unassigned' },
    { header: 'Status', render: (t) => <Badge tone={statusTone[t.status]}>{t.status.replace('_', ' ')}</Badge> },
    { header: 'Priority', render: (t) => <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge> },
    { header: 'Due', render: (t) => (t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—') },
    {
      header: 'Actions',
      render: (t) => (
        <div className="flex gap-2">
          <button
            aria-label={`Edit ${t.title}`}
            onClick={() => {
              setEditingTask(t);
              setModalOpen(true);
            }}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label={`Delete ${t.title}`}
            onClick={() => setDeletingTask(t)}
            className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Everything your team needs to get done, across every project."
        action={
          <Button
            onClick={() => {
              setEditingTask(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New task
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by title"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="sm:max-w-[160px]"
        >
          <option value="">All statuses</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="IN_REVIEW">In review</option>
          <option value="DONE">Done</option>
        </Select>
        <Select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className="sm:max-w-[160px]"
        >
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </Select>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Failed to load tasks." onRetry={() => refetch()} />}
      {!isLoading && !isError && data && data.data.length === 0 && (
        <EmptyState title="No tasks yet" description="Create a task and assign it to a project and employee." />
      )}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <Table columns={columns} rows={data.data} rowKey={(t) => t.id} />
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <TaskFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createTask.isPending || updateTask.isPending}
        initialTask={editingTask}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        title="Delete task"
        description={`Are you sure you want to delete "${deletingTask?.title}"?`}
        isLoading={deleteTask.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
}
