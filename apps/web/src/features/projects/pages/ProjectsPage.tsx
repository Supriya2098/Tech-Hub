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
import { formatINR } from '@/lib/currency';
import { useCreateProject, useDeleteProject, useProjects, useUpdateProject } from '../hooks';
import { ProjectFormModal, type ProjectFormValues } from '../components/ProjectFormModal';
import type { Project } from '../api';

const statusTone: Record<Project['status'], 'slate' | 'green' | 'yellow' | 'red' | 'blue'> = {
  PLANNING: 'slate',
  ACTIVE: 'green',
  ON_HOLD: 'yellow',
  COMPLETED: 'blue',
  CANCELLED: 'red',
};

export function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const { showToast } = useToast();
  const { data, isLoading, isError, refetch } = useProjects({
    page,
    limit: 10,
    search: search || undefined,
    status: (status || undefined) as Project['status'] | undefined,
  });
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  async function handleSubmit(values: ProjectFormValues) {
    const input = {
      ...values,
      customerId: values.customerId || undefined,
      budget: values.budget ? Number(values.budget) : undefined,
      startDate: values.startDate ? new Date(values.startDate) : undefined,
      endDate: values.endDate ? new Date(values.endDate) : undefined,
    };
    if (editingProject) {
      await updateProject.mutateAsync({ id: editingProject.id, input });
      showToast('Project updated', 'success');
    } else {
      await createProject.mutateAsync(input);
      showToast('Project created', 'success');
    }
  }

  async function handleDelete() {
    if (!deletingProject) return;
    try {
      await deleteProject.mutateAsync(deletingProject.id);
      showToast('Project deleted', 'success');
      setDeletingProject(null);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  }

  const columns: Column<Project>[] = [
    { header: 'Name', render: (p) => <span className="font-medium text-slate-900 dark:text-slate-100">{p.name}</span> },
    { header: 'Customer', render: (p) => p.customer?.name || '—' },
    { header: 'Status', render: (p) => <Badge tone={statusTone[p.status]}>{p.status.replace('_', ' ')}</Badge> },
    { header: 'Tasks', render: (p) => p._count.tasks },
    { header: 'Budget', render: (p) => (p.budget ? formatINR(Number(p.budget)) : '—') },
    {
      header: 'Actions',
      render: (p) => (
        <div className="flex gap-2">
          <button
            aria-label={`Edit ${p.name}`}
            onClick={() => {
              setEditingProject(p);
              setModalOpen(true);
            }}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label={`Delete ${p.name}`}
            onClick={() => setDeletingProject(p)}
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
        title="Projects"
        description="Track delivery across every customer engagement."
        action={
          <Button
            onClick={() => {
              setEditingProject(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by project name"
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
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Failed to load projects." onRetry={() => refetch()} />}
      {!isLoading && !isError && data && data.data.length === 0 && (
        <EmptyState title="No projects yet" description="Create a project to start assigning tasks." />
      )}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <Table columns={columns} rows={data.data} rowKey={(p) => p.id} />
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <ProjectFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createProject.isPending || updateProject.isPending}
        initialProject={editingProject}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingProject)}
        title="Delete project"
        description={`Are you sure you want to delete "${deletingProject?.name}"? Its tasks will also be deleted.`}
        isLoading={deleteProject.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingProject(null)}
      />
    </div>
  );
}
