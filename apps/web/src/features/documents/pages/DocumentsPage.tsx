import { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { extractErrorMessage } from '@/lib/axios';
import { useCreateDocument, useDeleteDocument, useDocuments, useUpdateDocument } from '../hooks';
import { DocumentFormModal, type DocumentFormValues } from '../components/DocumentFormModal';
import type { Document } from '../api';

export function DocumentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);

  const { showToast } = useToast();
  const { data, isLoading, isError, refetch } = useDocuments({ page, limit: 10, search: search || undefined });
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  async function handleSubmit(values: DocumentFormValues) {
    const tags = values.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const input = { name: values.name, url: values.url, mimeType: values.mimeType || undefined, tags };
    if (editingDocument) {
      await updateDocument.mutateAsync({ id: editingDocument.id, input });
      showToast('Document updated', 'success');
    } else {
      await createDocument.mutateAsync(input);
      showToast('Document added', 'success');
    }
  }

  async function handleDelete() {
    if (!deletingDocument) return;
    try {
      await deleteDocument.mutateAsync(deletingDocument.id);
      showToast('Document deleted', 'success');
      setDeletingDocument(null);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  }

  const columns: Column<Document>[] = [
    {
      header: 'Name',
      render: (d) => (
        <a
          href={d.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 font-medium text-brand-600 hover:underline"
        >
          {d.name}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ),
    },
    { header: 'Type', render: (d) => d.mimeType || '—' },
    {
      header: 'Tags',
      render: (d) => (
        <div className="flex flex-wrap gap-1">
          {d.tags.length === 0 ? '—' : d.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
      ),
    },
    { header: 'Added', render: (d) => new Date(d.createdAt).toLocaleDateString() },
    {
      header: 'Actions',
      render: (d) => (
        <div className="flex gap-2">
          <button
            aria-label={`Edit ${d.name}`}
            onClick={() => {
              setEditingDocument(d);
              setModalOpen(true);
            }}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label={`Delete ${d.name}`}
            onClick={() => setDeletingDocument(d)}
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
        title="Documents"
        description="Central library of contracts, receipts, and files."
        action={
          <Button
            onClick={() => {
              setEditingDocument(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add document
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Search by name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Failed to load documents." onRetry={() => refetch()} />}
      {!isLoading && !isError && data && data.data.length === 0 && (
        <EmptyState title="No documents yet" description="Add a link to a file to keep it organized here." />
      )}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <Table columns={columns} rows={data.data} rowKey={(d) => d.id} />
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <DocumentFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createDocument.isPending || updateDocument.isPending}
        initialDocument={editingDocument}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingDocument)}
        title="Delete document"
        description={`Are you sure you want to delete "${deletingDocument?.name}"?`}
        isLoading={deleteDocument.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingDocument(null)}
      />
    </div>
  );
}
