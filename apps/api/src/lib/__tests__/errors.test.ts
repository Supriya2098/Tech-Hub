import { describe, expect, it } from 'vitest';
import { AppError } from '../errors';

describe('AppError', () => {
  it('builds a 400 bad request with field errors', () => {
    const err = AppError.badRequest('Validation failed', { email: ['Invalid email'] });
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.fieldErrors).toEqual({ email: ['Invalid email'] });
  });

  it('builds a 401 unauthorized with a default message', () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.message).toBe('Unauthorized');
  });

  it('builds a 403 forbidden', () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('builds a 404 not found', () => {
    const err = AppError.notFound('Customer not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Customer not found');
  });

  it('builds a 409 conflict', () => {
    const err = AppError.conflict('Email already exists');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });
});
