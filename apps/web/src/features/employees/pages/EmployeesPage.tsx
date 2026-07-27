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
import { useCreateEmployee, useDeleteEmployee, useEmployees, useUpdateEmployee } from '../hooks';
import { EmployeeFormModal, type EmployeeFormValues } from '../components/EmployeeFormModal';
import type { Employee } from '../api';

const statusTone: Record<Employee['status'], 'slate' | 'green' | 'yellow' | 'red'> = {
  ACTIVE: 'green',
  ON_LEAVE: 'yellow',
  TERMINATED: 'red',
};

export function EmployeesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  const { showToast } = useToast();
  const { data, isLoading, isError, refetch } = useEmployees({
    page,
    limit: 10,
    search: search || undefined,
    status: (status || undefined) as Employee['status'] | undefined,
  });
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  async function handleSubmit(values: EmployeeFormValues) {
    const input = { ...values, salary: values.salary ? Number(values.salary) : undefined };
    if (editingEmployee) {
      await updateEmployee.mutateAsync({ id: editingEmployee.id, input });
      showToast('Employee updated', 'success');
    } else {
      await createEmployee.mutateAsync(input);
      showToast('Employee added', 'success');
    }
  }

  async function handleDelete() {
    if (!deletingEmployee) return;
    try {
      await deleteEmployee.mutateAsync(deletingEmployee.id);
      showToast('Employee removed', 'success');
      setDeletingEmployee(null);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  }

  const columns: Column<Employee>[] = [
    { header: 'Name', render: (e) => <span className="font-medium text-slate-900 dark:text-slate-100">{e.name}</span> },
    { header: 'Title', render: (e) => e.title || '—' },
    { header: 'Department', render: (e) => e.department || '—' },
    { header: 'Email', render: (e) => e.email },
    { header: 'Status', render: (e) => <Badge tone={statusTone[e.status]}>{e.status.replace('_', ' ')}</Badge> },
    {
      header: 'Actions',
      render: (e) => (
        <div className="flex gap-2">
          <button
            aria-label={`Edit ${e.name}`}
            onClick={() => {
              setEditingEmployee(e);
              setModalOpen(true);
            }}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label={`Delete ${e.name}`}
            onClick={() => setDeletingEmployee(e)}
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
        title="Employees"
        description="Manage your team roster and status."
        action={
          <Button
            onClick={() => {
              setEditingEmployee(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New employee
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by name, email, or title"
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
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On leave</option>
          <option value="TERMINATED">Terminated</option>
        </Select>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Failed to load employees." onRetry={() => refetch()} />}
      {!isLoading && !isError && data && data.data.length === 0 && (
        <EmptyState title="No employees yet" description="Add your first team member to get started." />
      )}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <Table columns={columns} rows={data.data} rowKey={(e) => e.id} />
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createEmployee.isPending || updateEmployee.isPending}
        initialEmployee={editingEmployee}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingEmployee)}
        title="Remove employee"
        description={`Are you sure you want to remove "${deletingEmployee?.name}"? This cannot be undone.`}
        isLoading={deleteEmployee.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingEmployee(null)}
      />
    </div>
  );
}
