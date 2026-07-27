import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { validate } from '../validate.middleware';
import { AppError } from '../../lib/errors';

function buildReq(overrides: Partial<Request>): Request {
  return { body: {}, query: {}, params: {}, ...overrides } as Request;
}

describe('validate middleware', () => {
  const schema = z.object({ name: z.string().min(1), age: z.coerce.number().int().min(0) });

  it('passes through and coerces valid input', () => {
    const req = buildReq({ body: { name: 'Ada', age: '30' } });
    const next = vi.fn();
    validate({ body: schema })(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'Ada', age: 30 });
  });

  it('calls next with an AppError on invalid input', () => {
    const req = buildReq({ body: { name: '', age: -1 } });
    const next = vi.fn();
    validate({ body: schema })(req, {} as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const errorArg = next.mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(AppError);
    expect(errorArg.statusCode).toBe(400);
    expect(errorArg.fieldErrors).toHaveProperty('name');
  });
});
