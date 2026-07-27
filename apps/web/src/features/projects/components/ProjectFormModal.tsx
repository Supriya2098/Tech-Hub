import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useCustomers } from '@/features/customers/hooks';
import type { Project } from '../api';

export interface ProjectFormValues {
  name: string;
  description: string;
  customerId: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  budget: string;
  startDate: string;
  endDate: string;
}

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialProject?: Project | null;
}

const emptyValues: ProjectFormValues = {
  name: '',
  description: '',
  customerId: '',
  status: 'PLANNING',
  budget: '',
  startDate: '',
  endDate: '',
};

export function ProjectFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialProject }: ProjectFormModalProps) {
  const [values, setValues] = useState<ProjectFormValues>(emptyValues);
  const [error, setError] = useState<string | null>(null);
  const { data: customersData } = useCustomers({ page: 1, limit: 100 });

  useEffect(() => {
    if (isOpen) {
      setValues(
        initialProject
          ? {
              name: initialProject.name,
              description: initialProject.description ?? '',
              customerId: initialProject.customerId ?? '',
              status: initialProject.status,
              budget: initialProject.budget ?? '',
              startDate: initialProject.startDate?.slice(0, 10) ?? '',
              endDate: initialProject.endDate?.slice(0, 10) ?? '',
            }
          : emptyValues,
      );
      setError(null);
    }
  }, [isOpen, initialProject]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialProject ? 'Edit project' : 'New project'}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Name"
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <Textarea
          label="Description"
          rows={3}
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
        />
        <Select
          label="Customer"
          value={values.customerId}
          onChange={(e) => setValues((v) => ({ ...v, customerId: e.target.value }))}
        >
          <option value="">No customer</option>
          {customersData?.data.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={values.status}
          onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as ProjectFormValues['status'] }))}
        >
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
        <Input
          label="Budget (₹)"
          type="number"
          min="0"
          step="0.01"
          value={values.budget}
          onChange={(e) => setValues((v) => ({ ...v, budget: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start date"
            type="date"
            value={values.startDate}
            onChange={(e) => setValues((v) => ({ ...v, startDate: e.target.value }))}
          />
          <Input
            label="End date"
            type="date"
            value={values.endDate}
            onChange={(e) => setValues((v) => ({ ...v, endDate: e.target.value }))}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialProject ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
