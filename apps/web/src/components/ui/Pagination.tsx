import type { PaginationMeta } from '@techhub/shared-types';
import { Button } from './Button';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Page {meta.page} of {meta.totalPages} &middot; {meta.total} total
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
