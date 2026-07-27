import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Document } from '../api';

export interface DocumentFormValues {
  name: string;
  url: string;
  mimeType: string;
  tagsInput: string;
}

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: DocumentFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialDocument?: Document | null;
}

const emptyValues: DocumentFormValues = { name: '', url: '', mimeType: '', tagsInput: '' };

export function DocumentFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialDocument }: DocumentFormModalProps) {
  const [values, setValues] = useState<DocumentFormValues>(emptyValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValues(
        initialDocument
          ? {
              name: initialDocument.name,
              url: initialDocument.url,
              mimeType: initialDocument.mimeType ?? '',
              tagsInput: initialDocument.tags.join(', '),
            }
          : emptyValues,
      );
      setError(null);
    }
  }, [isOpen, initialDocument]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialDocument ? 'Edit document' : 'New document'}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Name"
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <Input
          label="File URL"
          type="url"
          required
          placeholder="https://..."
          hint="Link to a file already hosted elsewhere (Drive, S3, etc.)"
          value={values.url}
          onChange={(e) => setValues((v) => ({ ...v, url: e.target.value }))}
        />
        <Input
          label="MIME type"
          placeholder="application/pdf"
          value={values.mimeType}
          onChange={(e) => setValues((v) => ({ ...v, mimeType: e.target.value }))}
        />
        <Input
          label="Tags"
          placeholder="contract, legal, 2026"
          hint="Comma-separated"
          value={values.tagsInput}
          onChange={(e) => setValues((v) => ({ ...v, tagsInput: e.target.value }))}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialDocument ? 'Save changes' : 'Add document'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
