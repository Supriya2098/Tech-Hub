import clsx from 'clsx';

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <div className="flex items-center justify-center py-10" role="status" aria-label={label}>
      <span className={clsx('h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent', className)} />
    </div>
  );
}
