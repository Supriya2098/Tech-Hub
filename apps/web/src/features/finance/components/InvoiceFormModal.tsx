import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useCustomers } from '@/features/customers/hooks';
import type { Invoice } from '../api';

export interface InvoiceFormValues {
  customerId: string;
  invoiceNumber: string;
  amount: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';
  dueAt: string;
}

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialInvoice?: Invoice | null;
}

const emptyValues: InvoiceFormValues = { customerId: '', invoiceNumber: '', amount: '', status: 'DRAFT', dueAt: '' };

export function InvoiceFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialInvoice }: InvoiceFormModalProps) {
  const [values, setValues] = useState<InvoiceFormValues>(emptyValues);
  const [error, setError] = useState<string | null>(null);
  const { data: customersData } = useCustomers({ page: 1, limit: 100 });

  useEffect(() => {
    if (isOpen) {
      setValues(
        initialInvoice
          ? {
              customerId: initialInvoice.customerId,
              invoiceNumber: initialInvoice.invoiceNumber,
              amount: initialInvoice.amount,
              status: initialInvoice.status,
              dueAt: initialInvoice.dueAt?.slice(0, 10) ?? '',
            }
          : emptyValues,
      );
      setError(null);
    }
  }, [isOpen, initialInvoice]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.customerId) {
      setError('Please select a customer');
      return;
    }
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialInvoice ? 'Edit invoice' : 'New invoice'}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Select
          label="Customer"
          required
          value={values.customerId}
          onChange={(e) => setValues((v) => ({ ...v, customerId: e.target.value }))}
        >
          <option value="">Select a customer</option>
          {customersData?.data.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          label="Invoice number"
          required
          value={values.invoiceNumber}
          onChange={(e) => setValues((v) => ({ ...v, invoiceNumber: e.target.value }))}
        />
        <Input
          label="Amount (₹)"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={values.amount}
          onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
        />
        <Select
          label="Status"
          value={values.status}
          onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as InvoiceFormValues['status'] }))}
        >
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="VOID">Void</option>
        </Select>
        <Input
          label="Due date"
          type="date"
          value={values.dueAt}
          onChange={(e) => setValues((v) => ({ ...v, dueAt: e.target.value }))}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialInvoice ? 'Save changes' : 'Create invoice'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
