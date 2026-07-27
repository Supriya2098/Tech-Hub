import { forwardRef, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',
            'dark:bg-slate-900 dark:text-slate-100',
            error ? 'border-red-400' : 'border-slate-300 dark:border-slate-700',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
