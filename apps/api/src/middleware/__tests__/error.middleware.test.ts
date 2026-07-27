import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { errorHandler } from '../error.middleware';
import { AppError } from '../../lib/errors';

function buildRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('error middleware', () => {
  it('serializes an AppError with its status code and code', () => {
    const res = buildRes();
    errorHandler(AppError.notFound('Customer not found'), {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Customer not found', code: 'NOT_FOUND', fieldErrors: undefined },
    });
  });

  it('falls back to a 500 for unknown errors without leaking internals', () => {
    const res = buildRes();
    errorHandler(new Error('some internal db detail'), {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
    });
  });
});
