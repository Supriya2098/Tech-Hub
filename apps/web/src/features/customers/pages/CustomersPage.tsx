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
import { useCreateCustomer, useCustomers, useDeleteCustomer, useUpdateCustomer } from '../hooks';
import { CustomerFormModal, type CustomerFormValues } from '../components/CustomerFormModal';
import type { Customer } from '../api';

const statusTone: Record<Customer['status'], 'slate' | 'green' | 'yellow' | 'red'> = {
  LEAD: 'yellow',
  ACTIVE: 'green',
  INACTIVE: 'slate',
  CHURNED: 'red',
};

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const { showToast } = useToast();
  const { data, isLoading, isError, refetch } = useCustomers({
    page,
    limit: 10,
    search: search || undefined,
    status: (status || undefined) as Customer['status'] | undefined,
  });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  async function handleSubmit(values: CustomerFormValues) {
    if (editingCustomer) {
      await updateCustomer.mutateAsync({ id: editingCustomer.id, input: values });
      showToast('Customer updated', 'success');
    } else {
      await createCustomer.mutateAsync(values);
      showToast('Customer created', 'success');
    }
  }

  async function handleDelete() {
    if (!deletingCustomer) return;
    try {
      await deleteCustomer.mutateAsync(deletingCustomer.id);
      showToast('Customer deleted', 'success');
      setDeletingCustomer(null);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  }

  const columns: Column<Customer>[] = [
    { header: 'Name', render: (c) => <span className="font-medium text-slate-900 dark:text-slate-100">{c.name}</span> },
    { header: 'Company', render: (c) => c.company || '—' },
    { header: 'Email', render: (c) => c.email || '—' },
    { header: 'Phone', render: (c) => c.phone || '—' },
    { header: 'Status', render: (c) => <Badge tone={statusTone[c.status]}>{c.status}</Badge> },
    {
      header: 'Actions',
      render: (c) => (
        <div className="flex gap-2">
          <button
            aria-label={`Edit ${c.name}`}
            onClick={() => {
              setEditingCustomer(c);
              setModalOpen(true);
            }}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label={`Delete ${c.name}`}
            onClick={() => setDeletingCustomer(c)}
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
        title="Customers"
        description="Manage leads and accounts across your organization."
        action={
          <Button
            onClick={() => {
              setEditingCustomer(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New customer
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by name, email, or company"
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
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="CHURNED">Churned</option>
        </Select>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Failed to load customers." onRetry={() => refetch()} />}
      {!isLoading && !isError && data && data.data.length === 0 && (
        <EmptyState title="No customers yet" description="Add your first customer to start tracking relationships." />
      )}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <Table columns={columns} rows={data.data} rowKey={(c) => c.id} />
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <CustomerFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createCustomer.isPending || updateCustomer.isPending}
        initialCustomer={editingCustomer}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingCustomer)}
        title="Delete customer"
        description={`Are you sure you want to delete "${deletingCustomer?.name}"? This cannot be undone.`}
        isLoading={deleteCustomer.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCustomer(null)}
      />
    </div>
  );
}
