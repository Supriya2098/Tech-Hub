import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { Customer } from '../api';

export interface CustomerFormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE' | 'CHURNED';
  notes: string;
}

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialCustomer?: Customer | null;
}

const emptyValues: CustomerFormValues = { name: '', email: '', phone: '', company: '', status: 'LEAD', notes: '' };

export function CustomerFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialCustomer }: CustomerFormModalProps) {
  const [values, setValues] = useState<CustomerFormValues>(emptyValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValues(
        initialCustomer
          ? {
              name: initialCustomer.name,
              email: initialCustomer.email ?? '',
              phone: initialCustomer.phone ?? '',
              company: initialCustomer.company ?? '',
              status: initialCustomer.status,
              notes: initialCustomer.notes ?? '',
            }
          : emptyValues,
      );
      setError(null);
    }
  }, [isOpen, initialCustomer]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customer');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialCustomer ? 'Edit customer' : 'New customer'}>
      <form id="customer-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Name"
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        <Input
          label="Phone"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
        />
        <Input
          label="Company"
          value={values.company}
          onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
        />
        <Select
          label="Status"
          value={values.status}
          onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as CustomerFormValues['status'] }))}
        >
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="CHURNED">Churned</option>
        </Select>
        <Textarea
          label="Notes"
          rows={3}
          value={values.notes}
          onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialCustomer ? 'Save changes' : 'Create customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
