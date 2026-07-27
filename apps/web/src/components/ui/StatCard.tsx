import type { LucideIcon } from 'lucide-react';
import { Card, CardBody } from './Card';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
        <span className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Icon className="h-5 w-5" />
        </span>
      </CardBody>
    </Card>
  );
}
