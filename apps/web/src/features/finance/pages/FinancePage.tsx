import { useState } from 'react';
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react';
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
import { useCreateInvoice, useDeleteInvoice, useInvoices, useRecordPayment, useUpdateInvoice } from '../hooks';
import { InvoiceFormModal, type InvoiceFormValues } from '../components/InvoiceFormModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import type { Invoice } from '../api';

const statusTone: Record<Invoice['status'], 'slate' | 'green' | 'yellow' | 'red' | 'blue'> = {
  DRAFT: 'slate',
  SENT: 'blue',
  PAID: 'green',
  OVERDUE: 'red',
  VOID: 'yellow',
};

export function FinancePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  const { showToast } = useToast();
  const { data, isLoading, isError, refetch } = useInvoices({
    page,
    limit: 10,
    search: search || undefined,
    status: (status || undefined) as Invoice['status'] | undefined,
  });
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const recordPayment = useRecordPayment();

  async function handleSubmit(values: InvoiceFormValues) {
    const input = { ...values, amount: Number(values.amount), dueAt: values.dueAt ? new Date(values.dueAt) : undefined };
    if (editingInvoice) {
      await updateInvoice.mutateAsync({ id: editingInvoice.id, input });
      showToast('Invoice updated', 'success');
    } else {
      await createInvoice.mutateAsync(input);
      showToast('Invoice created', 'success');
    }
  }

  async function handleDelete() {
    if (!deletingInvoice) return;
    try {
      await deleteInvoice.mutateAsync(deletingInvoice.id);
      showToast('Invoice deleted', 'success');
      setDeletingInvoice(null);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  }

  async function handleRecordPayment(amount: number) {
    if (!payingInvoice) return;
    await recordPayment.mutateAsync({ invoiceId: payingInvoice.id, input: { amount } });
    showToast('Payment recorded', 'success');
  }

  const columns: Column<Invoice>[] = [
    { header: 'Invoice #', render: (i) => <span className="font-medium text-slate-900 dark:text-slate-100">{i.invoiceNumber}</span> },
    { header: 'Customer', render: (i) => i.customer.name },
    { header: 'Amount', render: (i) => formatINR(Number(i.amount)) },
    { header: 'Status', render: (i) => <Badge tone={statusTone[i.status]}>{i.status}</Badge> },
    { header: 'Due', render: (i) => (i.dueAt ? new Date(i.dueAt).toLocaleDateString() : '—') },
    {
      header: 'Actions',
      render: (i) => (
        <div className="flex gap-2">
          {i.status !== 'PAID' && i.status !== 'VOID' && (
            <button
              aria-label={`Record payment for ${i.invoiceNumber}`}
              onClick={() => setPayingInvoice(i)}
              className="rounded p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
            >
              <CreditCard className="h-4 w-4" />
            </button>
          )}
          <button
            aria-label={`Edit ${i.invoiceNumber}`}
            onClick={() => {
              setEditingInvoice(i);
              setModalOpen(true);
            }}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label={`Delete ${i.invoiceNumber}`}
            onClick={() => setDeletingInvoice(i)}
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
        title="Finance"
        description="Invoices and payments across your customers."
        action={
          <Button
            onClick={() => {
              setEditingInvoice(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New invoice
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by invoice number"
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
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="VOID">Void</option>
        </Select>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Failed to load invoices." onRetry={() => refetch()} />}
      {!isLoading && !isError && data && data.data.length === 0 && (
        <EmptyState title="No invoices yet" description="Create an invoice to start billing your customers." />
      )}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <Table columns={columns} rows={data.data} rowKey={(i) => i.id} />
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <InvoiceFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createInvoice.isPending || updateInvoice.isPending}
        initialInvoice={editingInvoice}
      />

      <RecordPaymentModal
        isOpen={Boolean(payingInvoice)}
        onClose={() => setPayingInvoice(null)}
        invoice={payingInvoice}
        onSubmit={handleRecordPayment}
        isSubmitting={recordPayment.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingInvoice)}
        title="Delete invoice"
        description={`Are you sure you want to delete invoice "${deletingInvoice?.invoiceNumber}"?`}
        isLoading={deleteInvoice.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingInvoice(null)}
      />
    </div>
  );
}
