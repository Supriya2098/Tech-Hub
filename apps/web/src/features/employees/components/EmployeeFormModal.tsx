import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Employee } from '../api';

export interface EmployeeFormValues {
  name: string;
  email: string;
  department: string;
  title: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  salary: string;
}

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialEmployee?: Employee | null;
}

const emptyValues: EmployeeFormValues = { name: '', email: '', department: '', title: '', status: 'ACTIVE', salary: '' };

export function EmployeeFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialEmployee }: EmployeeFormModalProps) {
  const [values, setValues] = useState<EmployeeFormValues>(emptyValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValues(
        initialEmployee
          ? {
              name: initialEmployee.name,
              email: initialEmployee.email,
              department: initialEmployee.department ?? '',
              title: initialEmployee.title ?? '',
              status: initialEmployee.status,
              salary: initialEmployee.salary ?? '',
            }
          : emptyValues,
      );
      setError(null);
    }
  }, [isOpen, initialEmployee]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save employee');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialEmployee ? 'Edit employee' : 'New employee'}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Name"
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        <Input
          label="Title"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
        />
        <Input
          label="Department"
          value={values.department}
          onChange={(e) => setValues((v) => ({ ...v, department: e.target.value }))}
        />
        <Input
          label="Annual CTC (₹)"
          type="number"
          min="0"
          step="0.01"
          value={values.salary}
          onChange={(e) => setValues((v) => ({ ...v, salary: e.target.value }))}
        />
        <Select
          label="Status"
          value={values.status}
          onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as EmployeeFormValues['status'] }))}
        >
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On leave</option>
          <option value="TERMINATED">Terminated</option>
        </Select>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialEmployee ? 'Save changes' : 'Create employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
