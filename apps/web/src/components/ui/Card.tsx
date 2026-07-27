import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('border-b border-slate-100 px-5 py-4 dark:border-slate-800', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('px-5 py-4', className)} {...props} />;
}
