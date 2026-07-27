import type { ReactNode } from 'react';
import clsx from 'clsx';

type Tone = 'slate' | 'green' | 'yellow' | 'red' | 'blue';

const toneClasses: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
};

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', toneClasses[tone])}>
      {children}
    </span>
  );
}
