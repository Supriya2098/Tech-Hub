import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatINR } from '@/lib/currency';
import type { Invoice } from '../api';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSubmit: (amount: number) => Promise<void>;
  isSubmitting: boolean;
}

export function RecordPaymentModal({ isOpen, onClose, invoice, onSubmit, isSubmitting }: RecordPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    try {
      await onSubmit(value);
      setAmount('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    }
  }

  if (!invoice) return null;

  const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Number(invoice.amount) - totalPaid;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record payment - ${invoice.invoiceNumber}`}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Remaining balance: <span className="font-semibold">{formatINR(remaining)}</span>
        </p>
        <Input
          label="Payment amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Record payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
