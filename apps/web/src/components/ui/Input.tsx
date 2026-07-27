import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',
            'dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
            error ? 'border-red-400' : 'border-slate-300 dark:border-slate-700',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600">
            {error}
          </p>
        )}
        {!error && hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
