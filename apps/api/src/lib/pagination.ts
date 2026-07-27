import type { PaginationMeta } from '@techhub/shared-types';

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function toSkipTake(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}
